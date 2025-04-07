/**Copyright (c) 2025 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using EventUITest.Utils;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Text.RegularExpressions;
using System.Web;
using static EventUITest.UnitTesting;

namespace EventUITest.Pages.Unit
{
    public class TestRunnerModel : PageModel
    {
        public TestRunnerServerArgs ServerArgs { get; } = new TestRunnerServerArgs();

        public TestRunnerModel()
        {
        }

        public async void OnGet()
        {
            string filePath = Request.Query[EVUIConstants.QueryString_FileName];
            string debug = Request.Query[EVUIConstants.QueryString_Debug];
            string session = Request.Query[EVUIConstants.QueryString_Session];

            ServerArgs.testFilePath = filePath;
            ServerArgs.testSessionId = session;


            if (Boolean.TryParse(debug, out bool result) == true)
            {
                ServerArgs.debug = result;
            }

            DirectoryInfo rootDirectory = RootDirectoryFinder.GetRootRepositoryDirectory(new string[] { "src", "test", "license" }, true);
            
            string dirPath = rootDirectory.FullName + "\\test\\test_src" + filePath.Replace("/" + EVUIConstants.HttpPath_EVUI_Test_Source + "/", "/").Replace("/", "\\");
            DirectoryInfo directoryInfo = new FileInfo(dirPath).Directory;
            Regex isCommonFile = new Regex("\\.common\\..", RegexOptions.IgnoreCase);

            List<string> commonLibPaths = new List<string>();
            string httpRootFolder = filePath.Substring(0, filePath.LastIndexOf("/"));

            foreach (var file in directoryInfo.GetFiles())
            {
                if (isCommonFile.IsMatch(file.Name) == true)
                {
                    commonLibPaths.Add(httpRootFolder + "/" + file.Name);
                }
            }

            ServerArgs.commonLibPaths = commonLibPaths.ToArray();
        }

        public HtmlString GetServerArgsJSON()
        {
            return new HtmlString(System.Text.Json.JsonSerializer.Serialize(ServerArgs));
        }


    }
}
