/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using Microsoft.Extensions.FileProviders;

namespace EventUITest.Utils
{
    public static class StartupExtensions
    {
        public static WebApplication AddEventUIStaticContent(this WebApplication app, string rootSrcPath, string rootTestPath)
        {
            if (Directory.Exists(rootSrcPath) == false)
            {
                throw new DirectoryNotFoundException("Could not locate root EventUI's raw source path. \"" + rootSrcPath + "\" did not exist.");
            }

            if (Directory.Exists(rootTestPath) == false)
            {
                throw new DirectoryNotFoundException("Could not locate root EventUI's test source path. \"" + rootTestPath + "\" did not exist.");
            }

            app.UseStaticFiles();

            app.UseStaticFiles(new StaticFileOptions()
            {
                FileProvider = new PhysicalFileProvider(rootSrcPath),
                RequestPath = "/" + EVUIConstants.HttpPath_EVUI_Source,
            });

            app.UseStaticFiles(new StaticFileOptions()
            {
                FileProvider = new PhysicalFileProvider(rootTestPath),
                RequestPath = "/" + EVUIConstants.HttpPath_EVUI_Test_Source
            });

            return app;
        }

        public static WebApplication AddEventUIStaticContent(this WebApplication app)
        {
            DirectoryInfo rootContentPath = RootDirectoryFinder.GetRootRepositoryDirectory(new string[] { "license", "test", "src" }, true);

            string rootSrcPath = Path.Combine(rootContentPath.FullName, "src");
            string rootTestPath = Path.Combine(rootContentPath.FullName, "test", "test_src");

            return AddEventUIStaticContent(app, rootSrcPath, rootTestPath);
        }
    }
}
