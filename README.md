# JSON supported communication format
A low effort, no time consuming, communication format for JSON objects through for example internal APIs, web socket servers, etc.

## Manifests
  1. At the start of a communication session (after the handshake): a manifest should be estabilished from the server connecting a byte to a message header.
      -	A message’s header byte can range from 0 to 255.
  2. The manifest should be finished with a \0 character and then should the client start listening to messages.
  3. Any message sent with a header byte not in the manifest should be ignored.
  
## Messages
  1. The first byte of a message should be the message header defined in the manifest.
  2. The second to second last byte of a message should be the payload.
    -	The payload should contain the value of each property as defined in the message manifest, in the correct indexed order.
    -	Each property should not have a type identifier, such as quotations for strings. Each property is read raw.
    -	Each property should be seperated by a comma character (0x2C).
    -	If a property contains a comma character, it should be suffixed with a backslash character to escape it.
  3. The last byte of a message should be a \0 character.

## Example
```
0,ipsum,bar // 11 bytes
```
```js
{"header":0,"lorem":"ipsum","foo":"bar"} // 40 bytes
```
```json
{
  "lorem": "ipsum",
  "foo": "bar"
}
```
