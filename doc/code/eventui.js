$evui.init(async function ()
{
    $evui.addModal({
        id: "myModal",
        element: "#myModal",
        onShow: async function (eventArgs) //fires when the command to show the modal is issued and awaits the function before continuing to show the modal
        {
            var response = await fetch(/*some request*/)

            if (response.ok === true)
            {
                //populate the modal with data 
            }
            else
            {
                //populate error message or call eventArgs.cancel() to prevent the modal from ever being seen
            }
        }
    });

    await $evui.showModalAsync("myModal");


});