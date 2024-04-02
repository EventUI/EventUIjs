/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using EventUITest.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Text.RegularExpressions;

namespace EventUITest.Pages.Unit
{
    public class FilesModel : PageModel
    {
        public List<string> FilesToRun { get; set; } = new List<string>();

        public async Task OnGet()
        {
            var manifest = await UnitTesting.GetManifest(Request.Scheme + "://" + Request.Host + "/" + EVUIConstants.HttpPath_EVUI_Test_Source + "/" + EVUIConstants.TestManifestName);
            DirectoryInfo rootDirectory = RootDirectoryFinder.GetRootRepositoryDirectory(new string[] { "src", "test", "license" }, true);

            var hostArgs = UnitTesting.GetHostArgs(manifest, Path.Combine(rootDirectory.FullName, "test\\test_src\\"));
            Regex isCommonFile = new Regex("\\.common\\..", RegexOptions.IgnoreCase);

            FilesToRun = hostArgs.runOrder.Where(fileName => isCommonFile.IsMatch(fileName) == false).ToList();
            FilesToRun.Sort();
        }
    }
}
