# JSON supported communication format
A low effort, no time consuming, communication format for JSON objects through for example internal APIs, web socket servers, etc.

## Manifests
  1. At the start of a communication session (after the handshake): a manifest should be estabilished from the server connecting a key to a message header.
      -	A message’s header can range from 1 to 255^2.
  2. The manifest should have a header of 0 if sent through this communication format.
  3. Any message sent with a header byte not in the manifest will be ignored.
  
## Messages
  1. The first byte of a message should be a star character (*).
  2. The second and third byte should be the high and low bytes of the message header.
  2. The fourth to last byte of a message should be the payload.
      -	The payload should contain the value of each property as defined in the message manifest, in the correct indexed order.
      -	Each property should not have a type identifier, such as quotations for strings. Each property is read raw.
      -	Each property should be seperated by a comma/pipe character.
      -	If a property contains a comma/pipe character, it should be suffixed with a backslash character to escape it.

## Example
```
*??*??b\,ar,ipsum|{"hey":"there"} // 33 bytes
```
```js
[{"foo":"b,ar","lorem":"ipsum"},{"hey":"there"}] // 48 bytes
```
```json
[
  {
    "foo": "b,ar",
    "lorem": "ipsum"
  },
  "{\"hey\":\"there\"}"
]
```
