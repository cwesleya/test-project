using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.IO;
using System.Linq;
using TestProject.Constants;
using TestProject.Models;

namespace TestProject.Controllers
{
    [ApiController]
    [Route(AppConstants.ApiRouteBase)]
    public class TestController : ControllerBase
    {
        private readonly string _homeDirectory;

        public TestController(IConfiguration configuration)
        {
            _homeDirectory = configuration[AppConstants.DefaultRootDirectoryKey] ?? Directory.GetCurrentDirectory();
        }

        [HttpGet(AppConstants.BrowseEndpoint)]
        public IActionResult Browse([FromQuery] string? path = "")
        {
            var fullPath = Path.Combine(_homeDirectory, path ?? string.Empty);

            if (!Directory.Exists(fullPath))
            {
                return NotFound(AppConstants.DirectoryNotFoundMessage);
            }

            var directories = Directory
                .GetDirectories(fullPath)
                .Select(d => new DirectoryItem(new DirectoryInfo(d).Name, d))
                .ToList();
            var files = Directory
                .GetFiles(fullPath)
                .Select(f => new FileItem(new FileInfo(f).Name, f, new FileInfo(f).Length))
                .ToList();

            return Ok(new { directories, files });
        }

        [HttpGet(AppConstants.SearchEndpoint)]
        public IActionResult Search([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return Browse();
            }

            var files = Directory
                .GetFiles(_homeDirectory, $"*{query}*", SearchOption.AllDirectories)
                .Select(f => new FileItem(new FileInfo(f).Name, f, new FileInfo(f).Length))
                .ToList();

            return Ok(files);
        }

        [HttpPost(AppConstants.UploadEndpoint)]
        public IActionResult Upload([FromForm] IFormFile file, [FromQuery] string path = "")
        {
            var fullPath = Path.Combine(_homeDirectory, path);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                file.CopyTo(stream);
            }
            
            return Ok();
        }
    }
}