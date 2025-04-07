/**Copyright (c) 2025 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace EventUITest.Pages.Scratchpad
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;
        private IWebHostEnvironment _environment;

        public IndexModel(ILogger<IndexModel> logger, IWebHostEnvironment environment)
        {
            _logger = logger;
            _environment = environment;
        }

        public void OnGet()
        {

        }

        public HtmlString GetScratchpadHtml()
        {
            return new HtmlString(GetScratchpadHtml(GetScratchpads("Scratchpad")));
        }

        public string GetScratchpadHtml(List<RelativeFileReference> scratchpads)
        {
            if (scratchpads == null) return "";

            var html = "<ul>";

            foreach (var scratchpad in scratchpads)
            {
                if (scratchpad.IsFolder == false)
                {
                    html += "<li><a href=\"" + scratchpad.RelativePath + "\">" + scratchpad.PageName + "</a></li>";
                }
                else
                {
                    var subDir = GetSubdirectory(scratchpad);
                    var subFiles = GetScratchpads(subDir);
                    if (subFiles == null || subFiles.Count == 0) continue;

                    var index = subFiles.Find(file => file.PageName.ToLower() == "index");
                    if (index != null)
                    {
                        html += "<li><a href=\"" + index.RelativePath + "\">" + index.PageName + "</a>";
                    }
                    else
                    {
                        html += "<li>" + scratchpad.PageName;
                    }

                    html += GetScratchpadHtml(subFiles) + "</li>";
                }
            }

            html += "</ul>";

            return html;
        }

        public List<RelativeFileReference> GetScratchpads(string pagesSubDirectory)
        {
            if (pagesSubDirectory == null) return null;

            string rootPagesDir = Path.Combine(_environment.WebRootPath.Replace("wwwroot", ""), "Pages");
            string testPagesDirectory = Path.Combine(rootPagesDir, pagesSubDirectory);
            if (Directory.Exists(testPagesDirectory) == false) return null;

            var relaitvePaths = new List<RelativeFileReference>();

            var targetDir = new DirectoryInfo(testPagesDirectory);
            foreach (var fileSystemInfo in targetDir.EnumerateFileSystemInfos())
            {
                var relativeFile = new RelativeFileReference();

                if (fileSystemInfo is FileInfo fi)
                {
                    if (fi.Extension.ToLower() != ".cshtml") continue;

                    relativeFile.Path = fi.FullName;
                    relativeFile.PageName = fi.Name.Replace(fi.Extension, "");
                    relativeFile.RelativePath = Path.Combine(fi.Directory.FullName, relativeFile.PageName).Replace(rootPagesDir, "").Replace("\\", "/");
                }
                else if (fileSystemInfo is DirectoryInfo di)
                {
                    relativeFile.Path = di.FullName;
                    relativeFile.PageName = di.Name;
                    relativeFile.RelativePath = Path.Combine(di.FullName).Replace(rootPagesDir, "").Replace("\\", "/");
                    relativeFile.IsFolder = true;
                }

                relaitvePaths.Add(relativeFile);
            }           

            return relaitvePaths;
        }

        public string GetSubdirectory(RelativeFileReference relativeRef)
        {
            if (relativeRef == null)  return null;

            var scratchpadSubDir = "";
            var pathSegs = relativeRef.RelativePath.Split("/");
                
            for (var x = 1; x < pathSegs.Length; x++)
            {
                var curSeg = pathSegs[x];
                scratchpadSubDir += curSeg + "\\";
            }

            return scratchpadSubDir;
        }

        public class RelativeFileReference
        {
            public string Path { get; set; } = null;
            public string RelativePath { get; set; } = null;
            public string PageName { get; set; } = null;
            public bool IsFolder { get; set; } = false;
        }
    }
}
