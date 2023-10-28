/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using EventUITest.Utils;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace EventUITest.Pages.Unit
{
    public class AutoRunModel : PageModel
    {
        public UnitTesting.TestHostServerArgs HostServerArgs { get; set; } = new UnitTesting.TestHostServerArgs();

        public async Task OnGet()
        {
            var manifest = await UnitTesting.GetManifest(Request.Scheme + "://" + Request.Host + "/" + EVUIConstants.HttpPath_EVUI_Test_Source + "/" + EVUIConstants.TestManifestName);
            DirectoryInfo rootDirectory = RootDirectoryFinder.GetRootRepositoryDirectory(new string[] { "src", "test", "license" }, true);

            HostServerArgs = UnitTesting.GetHostArgs(manifest, Path.Combine(rootDirectory.FullName, "test\\test_src\\"));

        }

        public HtmlString GetHostArgsJSON()
        {
            return new HtmlString(System.Text.Json.JsonSerializer.Serialize(HostServerArgs));
        }
    }
}
