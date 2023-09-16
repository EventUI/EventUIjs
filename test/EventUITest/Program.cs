using EventUITest.Utils;
using Microsoft.Extensions.FileProviders;

namespace EventUITest
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddRazorPages();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();

            AddStaticFiles(app);
            
            app.UseRouting();

            app.UseAuthorization();

            app.MapRazorPages();

            app.Run();
        }

        internal static void AddStaticFiles(WebApplication app)
        {
            DirectoryInfo rootContentPath = RootDirectoryFinder.GetRootRepositoryDirectory(new string[] { "license", "test", "src", "build" }, true);

            string rootSrcPath = Path.Combine(rootContentPath.FullName, "src\\raw");
            string rootTestPath = Path.Combine(rootContentPath.FullName, "src\\test", "test_src");

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
                RequestPath = "/evuisrc",
            });

            app.UseStaticFiles(new StaticFileOptions()
            {
                FileProvider = new PhysicalFileProvider(rootTestPath),
                RequestPath = "/evuitest"
            });
        }
    }
}