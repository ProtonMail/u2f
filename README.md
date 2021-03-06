# U2F

U2F wrapper between ProtonMail API and `u2f-api`.

## Requirements:

- Node.js
- npm

To install dependencies:

```bash
npm install
```

## Usages:

The library exports two functions:

### `register`
It can be used to register a new key.

It accepts four arguments:

* `request` is the request received from the API. It has:

  * `RegisteredKeys` is the list of the already existing `RegisteredKey`, which itself has:

    * `Version` the version accepted by the key.
    * `KeyHandle` the keyhandle of the key

  * `Versions` are the different versions accepted by the server.
* `challenge` is the challenge generated by the backend, and that must be solved by the key.
* `appId` is the app id of the current app.
* `timeout` is the time after which the request will expire. The default is 10 seconds.


For example, the call can be done as follow:
```js
register({
        RegisteredKeys: [{
            Version: "U2F_V2",
            KeyHandle: "SomeBigStringThatWasGeneratedByAnotherToken"
        }, {
            Version: "U2F_V2",
            KeyHandle: "ItCanAlsoBeAKeyHandleGeneratedByTheSameKeyButItWillBeRejected"
        }],
        Versions: ["U2F_V2"]
    },
    "someChallenge",
    "https://proton.id",
    60
);

```


### `sign`
It can be used to sign with a key.

It accepts three arguments:

* `RegisteredKeys` is the list of the already existing `RegisteredKey`, which itself has:

    * `Version` the version accepted by the key.
    * `KeyHandle` the keyhandle of the key

* `challenge` is the challenge generated by the backend, and that must be solved by the key.
* `appId` is the app id of the current app.
* `timeout` is the time after which the request will expire. The default is 10 seconds.

For example it can look like this:
```js
sign([{
        Version: "U2F_V2",
        KeyHandle: "SomeBigStringThatWasGeneratedByAnotherToken"
    }, {
        Version: "U2F_V2",
        KeyHandle: "ItCanAlsoBeAKeyHandleGeneratedByTheSameKeyButItWillBeRejected"
    }],
    "someChallenge",
    "https://proton.id",
    60
);

```

