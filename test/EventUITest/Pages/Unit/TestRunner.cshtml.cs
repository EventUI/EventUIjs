/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Web;
using static EventUITest.UnitTesting;

namespace EventUITest.Pages.Unit
{
    public class TestRunnerModel : PageModel
    {
        public TestRunnerServerArgs ServerArgs { get; } = new TestRunnerServerArgs();

        public void OnGet()
        {
            string filePath = Request.Query["file"];
            string sessionId = Request.Query["session"];

            ServerArgs.testFilePath = filePath;
        }

        public HtmlString GetServerArgsJSON()
        {
            return new HtmlString(System.Text.Json.JsonSerializer.Serialize(ServerArgs));
        }


    }
}
