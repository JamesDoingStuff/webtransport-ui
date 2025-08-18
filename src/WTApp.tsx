import { Button, Stack, TextField } from '@mui/material';
import { useRef, useState } from 'react';
import { AppBar, Toolbar } from '@mui/material';
import { Typography } from '@mui/material';
import { Footer } from '@diamondlightsource/sci-react-ui';
import { styled } from '@mui/material/styles'

const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

function ConnectionField(setReader, setWriter) {
  const [address, setAddress] = useState("https://localhost:4433/tempcontroller");
  const [isConnected, setIsConnected] = useState(false)

  async function initTransport() {
    const wt = new WebTransport(address);
    await wt.ready

    console.log("Transport created")
    return wt;
  }

  async function connect() {
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
    const stream = await wt.createBidirectionalStream();

    setWriter(stream.writable.getWriter())
    setReader(stream.readable.getReader())
  }


  async function closeConnection(writer) {

    if (writer) {
      await writer.close().then(() => console.log("Closed writer.")
      ).catch(() => console.log("Writer went badly."))
      
      setWriter(null)
    }
      
    // if (wt)  {
    //   wt.close({
    //     closeCode: 17,
    //     reason: "CloseButtonPressed",
    //   });
    //   await wt.closed.then(() => console.log("Closed transport gracefully.")
    //   ).catch((err) => console.log(`Transport died kicking and screaming: ${err}`))
    //   wt = null
    }

    setIsConnected(false);
  
    
  //   async function read() {
  //     const decoder = new TextDecoder();
  //     while (true) {
  //       const { value, done } = await reader.read();
  //       if (done) {
  //         break
  //       }
  //       const received_data = decoder.decode(value, {stream: true});
  //       console.log(`Value received: ${received_data}\n`)
  //       setCurrentValue(received_data);
  //     }
  //   }

  //   read();
  //   return;
  // }

  return(
    <>
    <TextField 
        label="Device path"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <Typography align='center'>
        <Button
          onClick={() => connect()}
          variant='contained'
          style={{ 
            maxWidth: "100px",
          }}
          disabled={isConnected}
        >
          Connect
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

function App() { 
  const [data, setData] = useState("0")
  const [currentValue, setCurrentValue] = useState("0")
  
  const [wt, setWt] = useState<WebTransport|null>(null);
  const [writer, setWriter] = useState<WritableStreamDefaultWriter|null>(null);
  const [reader, setReader] = useState<ReadableStreamDefaultReader|null>(null);

  

  function sendWriterData(writer: WritableStreamDefaultWriter | null) {
    const encoder = new TextEncoder()
    const payload = encoder.encode(data)

    if(writer){
      writer.write(payload);
    }
  }

  


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
      <ConnectionField setReader={setReader} setWriter={setWriter}/>
      <Stack direction='row'>
        <TextField
          value={currentValue}
          label="Temperature"
          fullWidth
        />
        <TextField
          label="Set Temperature"
          defaultValue="0"
          onChange={(e) => setData(e.target.value)}
          fullWidth
        />
      </Stack>
      <Button
          onClick={() => sendWriterData(writer)}
        >
          Send test stream data
      </Button>
      </Stack>
      <Footer logo="theme" color="primary" position='fixed' width="100%"/>
    </>
  )
}

export default App
