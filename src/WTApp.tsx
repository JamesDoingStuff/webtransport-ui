// import { useEffect, useState } from 'react'
import { Button, Stack, TextField } from '@mui/material';
import { useRef, useState } from 'react';
import { AppBar, Toolbar } from '@mui/material';
import { Typography } from '@mui/material';
import { Footer } from '@diamondlightsource/sci-react-ui';
import { styled } from '@mui/material/styles'

const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

function App() { 
  const [address, setAddress] = useState("https://localhost:4433/tempcontroller");
  const [data, setData] = useState("0")
  const [currentValue, setCurrentValue] = useState("0")
  const [isConnected, setIsConnected] = useState(false)
  const wt = useRef<WebTransport|null>(null);
  const writer = useRef<WritableStreamDefaultWriter|null>(null);

  async function initTransport(url: string) {
    wt.current = new WebTransport(url);

    if (wt.current) {await wt.current.ready}
    else console.log("Transport does not exist")

    console.log("Transport created")
    return;
  }

  function sendWriterData(writer: WritableStreamDefaultWriter | null) {
    const encoder = new TextEncoder()
    const payload = encoder.encode(data)

    if(writer){
      writer.write(payload);
    }
  }

  async function closeWriter() {

    if (writer.current) {
      await writer.current.close().then(() => console.log("Closed writer.")
      ).catch(() => console.log("Writer went badly."))
      
      writer.current = null
    }
      
    if (wt.current)  {
      wt.current.close({
        closeCode: 17,
        reason: "CloseButtonPressed",
      });
      await wt.current.closed.then(() => console.log("Closed transport gracefully.")
      ).catch((err) => console.log(`Transport died kicking and screaming: ${err}`))
      wt.current = null
    }

    setIsConnected(false);
  }

  async function connect(url: string) {
    try {await initTransport(url)}
    catch {
      console.log("Failed to create transport");
      return;
    }
  
    if (!wt.current) {
      console.log("No transport");
      return;
    }
    
    const stream = await wt.current.createBidirectionalStream();

    writer.current = stream.writable.getWriter();
    const reader = stream.readable.getReader();

    setIsConnected(true);
    async function read() {
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break
        }
        const received_data = decoder.decode(value, {stream: true});
        console.log(`Value received: ${received_data}\n`)
        setCurrentValue(received_data);
      }
    }

    read();
    return;
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
        <TextField 
          label="Device path"
          defaultValue={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <Typography align='center'>
          <Button
            onClick={() => connect(address)}
            variant='contained'
            style={{ 
              maxWidth: "100px",
            }}
            disabled={isConnected}
          >
            Connect
          </Button>
          <Button 
            onClick={() => closeWriter()}
            disabled={!isConnected}
          >
            Close connection
          </Button>
        </Typography>
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
          onClick={() => sendWriterData(writer.current)}
        >
          Send test stream data
      </Button>
      </Stack>
      <Footer logo="theme" color="primary" position='fixed' width="100%"/>
    </>
  )
}

export default App
