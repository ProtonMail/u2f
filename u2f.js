/**
 * Transform a given object to PascalCase keys ({key: "value"} => {Key: "value"}.
 *
 * Inner object are not treated.
 * @param {{}} objectToParse
 * @returns {{}}
 */
function parseObjectToPascalCase(objectToParse = {}) {
    return Object.keys(objectToParse)
        .reduce((acc, key) => {
        const newKey = key[0].toUpperCase() + key.slice(1);
            acc[newKey] = objectToParse[key];
        return acc;
    }, {});
}

/**
 * Transform a list of registered keys to a list compatible with U2F-API.
 *
 * @inner
 * @param {RegisteredKey[]} registeredKeys - the registered keys list.
 * @param {String} appId - the app id to associate with this key.
 * @returns {Object[]}
 */
function transformRegisteredKeys(registeredKeys = [], appId) {
    return registeredKeys.map((key) => ({
        version: key.Version,
        keyHandle: key.KeyHandle,
        appId
    }));
}

/**
 * Validates the request data. Ensures it is compatible with a U2F request.
 * @inner
 * @param {Object[]} registeredKeys
 * @param {String} challenge
 * @returns {Boolean}
 */
function validateRequestData(registeredKeys, challenge) {
    return registeredKeys && Array.isArray(registeredKeys) && challenge;
}

/**
 * Validates the registration request data.
 * @inner
 * @param {Object[]} registeredKeys
 * @param {String} challenge
 * @param {String[]} versions
 * @returns {Boolean}
 */
function validateRegistrationData(registeredKeys, challenge, versions) {
    return validateRequestData(registeredKeys, challenge) && Array.isArray(versions) && versions.length > 0;
}



/**
 * Call the given U2F method, and parse the response into a promise.
 *
 * The function must accept a single callback, which corresponds to the U2F API callback.
 *
 * @inner
 * @param {Function} func
 * @returns {Promise<any>}
 */
function callU2F(func) {
    return new Promise((resolve, reject) => {
        func((deviceResponse) => {
            const parsedResponse = parseObjectToPascalCase(deviceResponse);
            if (parsedResponse.ErrorCode) {
                return reject(parsedResponse);
            }
            return resolve(parsedResponse);
        });
    });
}

/**
 * Sends a register request to `u2f-api`.
 *
 * @param {object} request - the request to send to `u2f-api`.
 * @param {Object[]} request.RegisteredKeys - a list of registered keys. Usually given by the callback.
 * @param {String} request.RegisteredKeys[].Version
 * @param {String} request.RegisteredKeys[].KeyHandle
 * @param {String} request.Challenge - the challenge to solve.
 * @param {String[]} request.Versions - a list of accepted versions.
 * @param {String} appId - the app id of the current frontend.
 * @param {int} [timeout = 10] - the timeout after which the request expires.
 * @returns {Promise}
 */
export function register(
    { RegisteredKeys: registeredKeys, Challenge: challenge, Versions: versions },
    appId,
    timeout = 10
) {
    if (!validateRegistrationData(registeredKeys, challenge, versions)) {
        throw new Error('request data is not valid');
    }
    const registerRequests = versions.map((version) => ({
        version: version,
        challenge: challenge,
        appId: appId
    }));

    return callU2F((cb) => u2f.register(appId, registerRequests, transformRegisteredKeys(registeredKeys, appId), cb, timeout));
}

/**
 * Sends a sign request to the `u2f-api`.
 *
 * @param {Object[]} registeredKeys - a list of registered keys.
 * @param {String} registeredKeys[].Version
 * @param {String} registeredKeys[].KeyHandle
 * @param {String[]} challenge - the challenge to solve.
 * @param {String} appId - the app id of the current application.
 * @param {int} [timeout = 10] - the timeout after which the request will expire.
 * @returns {Promise}
 */
export function sign({ RegisteredKeys: registeredKeys, Challenge: challenge }, appId, timeout = 10) {
    if (!validateRequestData(registeredKeys, challenge)) {
        throw new Error('request data is not valid');
    }
    return callU2F((cb) => u2f.sign(appId, challenge, transformRegisteredKeys(registeredKeys, appId), cb, timeout));
}
