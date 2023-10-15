using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Web;

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

        public class TestRunnerServerArgs
        {
            public string testFilePath { get; set; } = null;
        }
    }
}
