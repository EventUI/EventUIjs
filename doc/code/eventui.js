
/*Race condition example*/
    addEventListener('click', async function (event)
    {
        console.log("Handler 1 Start");
        await fetch(/*Some web service call*/);
        console.log("Handler 1 Finish");
    });

    addEventListener('click', async function (event)
    {
        console.log("Handler 2 Start");
        await fetch(/*Some other web service call*/);
        console.log("Handler 2 Finish");
    });

/*Fixing race condition example with a wait loop.*/

    var fetch1Finished = false;

    addEventListener('click', async function (event)
    {
        console.log("Handler 1 Start");
        await fetch(/*Some web service call*/);
        fetch1Finished = true;

        console.log("Handler 1 Finish");
    });

    addEventListener('click', async function (event)
    {
        console.log("Handler 2 Start");

        while (fetch1Finished === false)
        {
            await $evui.waitAsync(10); //wait in 10 millisecond increments in a async loop for the first call to signal that it's done
        }

        await fetch(/*Some other web service call*/);
        console.log("Handler 2 Finish");
    });

/*EventUI race condition solution*/

    addAsyncEventListener('click', async function (event)
    {
        console.log("Handler 1 Start");
        await fetch(/*Some web service call*/);
        console.log("Handler 1 Finish");
    });

    addAsyncEventListener('click', async function (event)
    {
        console.log("Handler 2 Start");
        await fetch(/*Some other web service call*/);
        console.log("Handler 2 Finish");
    });



$evui.showModalAsync({
    id: "someModal",
    loadSettings:
    {
        selector: "#myModal"
    },
    onShow: async function (modalArgs)
    {
        var data = await fetch(/*A request to get data to bind in the modal*/);
        if (data.ok === false)
        {
            modalArgs.cancel(); //request failed, don't show modal
            return;
        }

        var dataToBind = await data.json();
        var targetDataArea = $evui.dom(".dataArea", modalArgs.modal.element);

        await $evui.bindAsync({
            htmlContent: "<li>{{someProperty}}</li>",
            source: dataToBind,
            bindingTarget: targetDataArea.elements[0],

        });

        
    }
})