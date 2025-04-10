// Stockfish WebWorker wrapper
onmessage = function(e) {
    postMessage(e.data);
};

// Importing Stockfish WASM module
importScripts('stockfish.wasm.js');

// Initialize the engine
Stockfish().then(sf => {
    // Forward output from Stockfish to the main thread
    sf.addMessageListener(line => {
        postMessage(line);
    });

    // Handle messages from the main thread
    onmessage = function(e) {
        sf.postMessage(e.data);
    };
});
