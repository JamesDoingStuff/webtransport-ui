import { Button, Stack, TextField, Box, Divider } from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import { AppBar, Toolbar } from '@mui/material';
import { Typography } from '@mui/material';
import { Footer } from '@diamondlightsource/sci-react-ui';
import { styled } from '@mui/material/styles'

const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

interface ConnectionFieldProps {
  wt: WebTransport | null;
  setWt: React.Dispatch<React.SetStateAction<WebTransport | null>>;
}

interface PvFieldProps {
  pvName: string;
  wt: WebTransport | null
}

function ConnectionField({ wt, setWt }: ConnectionFieldProps) {
  const [address, setAddress] = useState("https://localhost:4433/tempcontroller");
  const [isConnected, setIsConnected] = useState(false)

  async function initTransport() {
    const wt = new WebTransport(address);
    await wt.ready

    console.log("Transport created")
    return wt;
  }

  async function create_transport() {
    let wt = null
    try {wt = await initTransport()}
    catch {
      console.log("Failed to create transport");
      return;
    }
  
    if (!wt) {
      console.log("No transport");
      return;
    }
    setIsConnected(true);
    setWt(wt)
    // const stream = await wt.createBidirectionalStream();

    // setWriter(stream.writable.getWriter())
    // setReader(stream.readable.getReader())
  }

  async function closeConnection() {
    console.log("Called the function")
    if(wt) {
      try{wt.close()}
      catch{console.log("There was an error :(")}
      setWt(null);
      setIsConnected(false);
      return
      // await wt.closed;
    };
  }

  return(
    <>
    <TextField 
        label="Device path"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <Typography align='center'>
        <Button
          onClick={() => create_transport()}
          variant='contained'
          style={{ 
            maxWidth: "100px",
          }}
          disabled={isConnected}
        >
          Create Transport
        </Button>
        <Button 
          onClick={() => closeConnection()}
          disabled={!isConnected}
        >
          Close connection
        </Button>
      </Typography>
    </>
  )
}

function PvField({ pvName, wt }: PvFieldProps){
  const [currentValue, setCurrentValue] = useState("0")
  const [targetValue, setTargetValue] = useState("0")
  // const [writer, setWriter] = useState<WritableStreamDefaultWriter|null>(null);
  const [stream, setStream] = useState<WebTransportBidirectionalStream|null>(null)


  function send_value() {
    const encoder = new TextEncoder()
    const json_payload = `{"pv":"${pvName}", "value":"${targetValue}", "command":"set"}`
    const payload = encoder.encode(json_payload)

    const writer = stream?.writable.getWriter()
    if(writer){
      writer.write(payload);
      console.log(`Sent data: ${json_payload}`)
    } else (console.log("No writer"))
    writer?.releaseLock()
  }

  useEffect(() => {
    if (!wt) {
      console.log("Null webtransport")
      return;
    }
    (async () => {setStream(await wt.createBidirectionalStream())})();
    console.log("New stream created")
    
  },[wt])

  useEffect(() => {
    

    let isActive = true;


    (async () => {
      console.log("Running the read loop")
      
      const writer = stream?.writable.getWriter()
      const reader = stream?.readable.getReader()
      const decoder = new TextDecoder();

      if (writer){
        // TODO: Add GET and SET commands here
        const raw_data = `{ "pv": "${pvName}", "command": "set" }`
        const encoder = new TextEncoder()
        const payload = encoder.encode(raw_data)
        console.log("Opening command sent: " + payload)
        writer.write(payload)
        writer.releaseLock()
      }
      try{
        while (isActive && reader) {
          const { value, done } = await reader.read();
          if (done) {
            break
          }
          const received_data = decoder.decode(value, {stream: true});
          console.log(`Value received: ${received_data}\n`)
          setCurrentValue(received_data);
        }
      }
      catch (err) {
        console.log(err)
      }


    })();

    return () => {
      console.log("Running cleanup")
      isActive = false;
      // if (writer){
      //   writer.close()
      //   setWriter(null)
      // }
      // if (reader){
      //   reader.cancel()
      //   setReader(null)
      // }
    }


    }, [wt, pvName, stream])

  return(
    <Stack direction='row' spacing={2}>
      <Box width={'100%'} alignContent={'center'} justifyContent={'center'}> 
        <Typography>
          {pvName}: 
        </Typography>
      </Box>
        <TextField
          value={currentValue}
          label="Current"
          fullWidth
        />
        <TextField
          label="Set"
          defaultValue="0"
          onChange={(e) => setTargetValue(e.target.value)}
          fullWidth
        />
      <Button
          onClick={() => send_value()}
          fullWidth
        >
          Send target value
      </Button>
    </Stack>
  )
}

function MuxStressTester() {
  const [numStreams, setNumStreams] = useState(0)
  const isRunning = useRef(false)


  async function handleStressTest() {
    console.log("Handling...")
    isRunning.current = true

    const wt = new WebTransport("https://localhost:4433/stress")
    const writer_array = [];

    await wt.ready
    console.log("Finished awaiting")

    for (let streamNum=0;streamNum < numStreams; streamNum++) {
      const stream = await wt.createBidirectionalStream()
      const writer = stream.writable.getWriter();
      writer_array.push(writer)
    }
    console.log("Finished creating streams")
    console.log(`Running: ${isRunning}`)
    
    let i = 0
    
    while(isRunning.current){
      console.log("Starting the loop")
      for (const [stream_number, writer] of writer_array.entries()) {
        const encoder = new TextEncoder();
        const payload = encoder.encode(`n = ${stream_number}, i = ${i}`)

        
        console.log("Sending mass data: ", `${stream_number} on iteration ${i}`)
        await writer.write(payload)
        await sleep(10)
      }
      i++;
    }
    console.log("Skipped the loop :(")
    wt.close()
  }



  return (
    <Stack direction="row" spacing={2}>
      <TextField 
        onChange={(e) => setNumStreams(Number(e.target.value))}
        label='Number of streams'
      />
    <Button
      onClick={() => handleStressTest()}
      variant='contained'
    >
      Stress test
    </Button>
    <Button 
      onClick={() => isRunning.current=false}
    >
      Stop!
    </Button>
    </Stack>
  )
}

function SeparateStressTester() {
  const [numTransports, setNumTransports] = useState(0);
  const isRunning = useRef(false)

  async function handleStressTest() {
    isRunning.current = true


    for (let i = 0; i < numTransports; ){
      const webtransport = new WebTransport("https://localhost:4433/stress");
      await webtransport.ready
      const stream = await webtransport.createBidirectionalStream();
      const writer = stream.writable.getWriter();

      const encoder = new TextEncoder()
      const payload = encoder.encode(`Data: ${i}`)
      
      while (isRunning) {
        writer.write(payload)
      }
      
      webtransport.close()

      
    }


  }

  return (
    <Stack direction="row" spacing={2}>
      <TextField 
        onChange={(e) => setNumTransports(Number(e.target.value))}
        label='Number of streams'
      />
    <Button
      onClick={() => handleStressTest()}
      variant='contained'
    >
      Stress test
    </Button>
    <Button 
      onClick={() => isRunning.current=false}
    >
      Stop!
    </Button>
    </Stack>
  )
}


function App() { 
  const [wt, setWt] = useState<WebTransport|null>(null);

  return (
    <>
      <AppBar color='primary' position='static'>
        <Toolbar>
          <Typography>
            WebTransport Demo
          </Typography>
        </Toolbar>
      </AppBar>
      <Offset/>
      <Stack spacing={2}>
        <ConnectionField wt={wt} setWt={setWt}/>
        <PvField pvName="Temperature"  wt={wt}></PvField>
        <PvField pvName="Temperature 2"  wt={wt}></PvField>
        <PvField pvName="Temperature 3"  wt={wt}></PvField>
        <Divider/>
        <Typography>
          Multiplexed Streams Stress Tester:
        </Typography>
        <MuxStressTester/>
        <Divider/>
        <Typography>
          Separate Transport Stress Tester
        </Typography>
        <SeparateStressTester/>
      </Stack>
      <Footer logo="theme" color="primary" position='fixed' width="100%"/>
    </>
  )
}

export default App
