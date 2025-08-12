// import { useEffect, useState } from 'react'
import { Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';



function App() { 
  const [address, setAddress] = useState("https://localhost:4433/tempcontroller");
  const [data, setData] = useState("Test data")
  // const [wt, setWt] = useState<WebTransport | null>(null);
  // const [isConnected, setIsConnected] = useState(false);
  // const [writer, setWriter] = useState<WritableStreamDefaultWriter | null>(null)
  let wt: WebTransport | null = null;
  let writer: WritableStreamDefaultWriter | null = null;

  async function initTransport(url: string) {
    wt = new WebTransport(url);

    if (wt) {await wt.ready}
    else console.log("Wt not set")
    
    // setIsConnected(true)
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
    if (wt)  {
      wt.close();
      await wt.closed
    }
  }

  async function connect(url: string) {
    await initTransport(url);
    // setWt(transport)
    if (!wt) {
      console.log("Null transport");
      return;
    }
    
    const stream = await wt.createBidirectionalStream();

    writer = stream.writable.getWriter();
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
          onClick={() => sendWriterData(writer)}
        >
          Send test stream data
        </Button>
        <Button
          onClick={() => closeWriter(writer)}
        >
          Close connection
        </Button>
        </Stack>
      </>
  )
}

export default App
