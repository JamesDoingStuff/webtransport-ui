import {Config, KeyExpr, Session, Sample, Subscriber, Publisher, ZBytes} from "@eclipse-zenoh/zenoh-ts";
import Button from '@mui/material/Button'

const server_url = "ws://localhost:10001"

const key = "hello/world"
const config = new Config(server_url)
const session = Session.open(config)

// // const handle_subscription = (sample: Sample) => Promise.resolve(console.log("Payload received: " + sample.payload.toString()))

// const publisher: Publisher = session.declare_publisher(key, {})
// // session.declare_subscriber(key, {handler: handle_subscription})

// const msg = ""

function App() { 

  return (
    // <div>
    //   <Button
    //     // onClick={() => publisher.put(msg)}
    //   >
    //     Publish
    //   </Button>
    //   <p>{}</p>
    // </div>
    <>
    </>
  )
}

export default App
