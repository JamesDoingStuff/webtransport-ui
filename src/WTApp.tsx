// import { useEffect, useState } from 'react'
import { Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';










// async function sendData(wt: WebTransport | null){
//   if(wt) {
//     await wt.ready
//     const stream = await wt.createUnidirectionalStream();
    
//     const writer = stream.getWriter();
//     const TEST_DATA = new Uint8Array([3,6,9]);
//     writer.write(TEST_DATA);
//     // await writer.close()
//     // closeTransport(wt);

//     console.log("Data has been sent!");
//   }
// }

function sendWriterData(writer: WritableStreamDefaultWriter | null) {
  const encoder = new TextEncoder()
  const data = encoder.encode("Test stream data")
  if(writer){
    // const TEST_DATA = new Uint8Array([3,6,9]);
    writer.write(data);
  }
}


function App() { 
  const [address, setAddress] = useState("https://localhost:4433/tempcontroller");
  // const [wt, setWt] = useState<WebTransport | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [writer, setWriter] = useState<WritableStreamDefaultWriter | null>(null)

  async function initTransport(url: string) {
    const wt = new WebTransport(url);

    await wt.ready;
    
    setIsConnected(true)
    console.log("Transport created")
    return wt
  }

  async function connect(url: string) {
    const wt = await initTransport(url)
    // setWt(transport)
    if (!isConnected) {
      console.log("Null transport");
      return;
    }
    const stream = await wt.createBidirectionalStream();

    setWriter(stream.writable.getWriter());
    const reader = stream.readable.getReader();

    async function read() {
      const decoder = new TextDecoder();
      while (isConnected) {
        const { value, done } = await reader.read();
        if (done) {
          return
        }
        const received_data = decoder.decode(value);
        console.log(`Value received: ${received_data}\n`)
      }
      console.log("Reading finished. Closing connection.")
      await writer?.close()
      wt.close()
      await wt.closed
    }

    read();
    return;
  }

  // async function closeWriter(writer: WritableStreamDefaultWriter | null) {
  //   if (writer) await writer.close()
  //   if (wt)  {
  //     wt.close();
  //     await wt.closed
  //  }
  // }

  return (
      <>
        <Stack>
        <TextField 
          label="Device path"
          defaultValue={address}
          onChange={(e) => setAddress(e.target.value)}
        ></TextField>
        <Button
          onClick={() => connect(address)}
        >
          Connect
        </Button>
        <Button
          onClick={() => sendWriterData(writer)}
        >
          Send test stream data
        </Button>
        <Button
          onClick={() => setIsConnected(false)}
        >
          Close connection
        </Button>
        </Stack>
      </>
  )
}

export default App
