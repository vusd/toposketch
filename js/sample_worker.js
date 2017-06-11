onmessage = function(event)
{   console.log('Message received! Passing to TestWorker...');
    
    test_worker = new TestWorker();
    test_worker.post(event.data);
}

function TestWorker()
{
    TestWorker.prototype.post = function(message)
    {   console.log('Test Worker here!');
        console.log(message);
        postMessage('Message received loud and clear~!');
    }
}





