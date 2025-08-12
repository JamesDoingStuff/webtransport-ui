// import { useEffect, useState } from 'react'
import { Button, Stack, TextField } from '@mui/material';
import { useRef, useState } from 'react';



function App() { 
  const [address, setAddress] = useState("https://localhost:4433/tempcontroller");
  const [data, setData] = useState("Test data")
  const wt = useRef<WebTransport|null>(null);
  const writer = useRef<WritableStreamDefaultWriter|null>(null);

  async function initTransport(url: string) {
    wt.current = new WebTransport(url);

    if (wt.current) {await wt.current.ready}
    else console.log("Wt not set")

    console.log("Transport created")
    return;
  }

  function sendWriterData(writer: WritableStreamDefaultWriter | null) {
    const encoder = new TextEncoder()
    const payload = encoder.encode(data)
    if(writer){
      // const TEST_DATA = new Uint8Array([3,6,9]);
      writer.write(payload);
    }
  }

  async function closeWriter(writer: WritableStreamDefaultWriter | null) {
    if (writer) await writer.close()
    if (wt.current)  {
      wt.current.close();
      await wt.current.closed
    }
  }

  async function connect(url: string) {
    await initTransport(url);
    // setWt(transport)
    if (!wt.current) {
      console.log("Null transport");
      return;
    }
    
    const stream = await wt.current.createBidirectionalStream();

    writer.current = stream.writable.getWriter();
    const reader = stream.readable.getReader();

    async function read() {
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break
        }
        const received_data = decoder.decode(value);
        console.log(`Value received: ${received_data}\n`)
      }
    }

    read();
    return;
  }


  return (
      <>
        <Stack>
        <TextField 
          label="Device path"
          defaultValue={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <Button
          onClick={() => connect(address)}
        >
          Connect
        </Button>
        <TextField
          label="Data to send"
          defaultValue="Test data"
          onChange={(e) => setData(e.target.value)}
        />
        <Button
          onClick={() => sendWriterData(writer.current)}
        >
          Send test stream data
        </Button>
        <Button
          onClick={() => closeWriter(writer.current)}
        >
          Close connection
        </Button>
        </Stack>
      </>
  )
}

export default App
