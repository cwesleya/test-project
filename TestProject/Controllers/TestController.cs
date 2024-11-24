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
    [Produces("application/json")]
    public class TestController : ControllerBase
    {
        private readonly string _homeDirectory;

        public TestController(IConfiguration configuration)
        {
            _homeDirectory = configuration[AppConstants.DefaultRootDirectoryKey] ?? Directory.GetCurrentDirectory();
        }

        [HttpGet(AppConstants.BrowseEndpoint)]
        public IActionResult Browse(
            [FromQuery] string? path = "", 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = AppConstants.DefaultPageSize)
        {
            var fullPath = Path.Combine(_homeDirectory, path ?? string.Empty);

            if (!Directory.Exists(fullPath))
            {
                return NotFound(AppConstants.DirectoryNotFoundMessage);
            }

            var directoriesQuery = Directory
                .EnumerateDirectories(fullPath)
                .Select(d => new DirectoryItem(new DirectoryInfo(d).Name, d));
            var filesQuery = Directory
                .EnumerateFiles(fullPath)
                .Select(f => new FileItem(new FileInfo(f).Name, f, new FileInfo(f).Length));

            if (pageSize > 0)
            {
                directoriesQuery = directoriesQuery.Skip((page - 1) * pageSize).Take(pageSize);
                filesQuery = filesQuery.Skip((page - 1) * pageSize).Take(pageSize);
            }

            var directories = directoriesQuery.ToList();
            var files = filesQuery.ToList();

            return Ok(new { directories, files });
        }

        [HttpGet(AppConstants.SearchEndpoint)]
        public IActionResult Search(
            [FromQuery] string? query, 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = AppConstants.DefaultPageSize)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return Browse(page: page, pageSize: pageSize);
            }

            var filesQuery = Directory.EnumerateFiles(_homeDirectory, $"*{query}*", SearchOption.AllDirectories)
                                      .Select(f => new FileItem(new FileInfo(f).Name, f, new FileInfo(f).Length));

            if (pageSize > 0)
            {
                filesQuery = filesQuery.Skip((page - 1) * pageSize).Take(pageSize);
            }

            var files = filesQuery.ToList();

            return Ok(files);
        }

        [HttpPost(AppConstants.UploadEndpoint)]
        public IActionResult Upload([FromForm] IFormFile file, [FromQuery] string? path = "")
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            var fullPath = Path.Combine(_homeDirectory, path ?? string.Empty, file.FileName);

            try
            {
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    file.CopyTo(stream);
                }
            }
            catch (Exception ex)
            {
                // Log the exception (ex) here if needed
                return StatusCode(500, "Internal server error: " + ex.Message);
            }

            return Ok("File uploaded successfully.");
        }

        [HttpDelete(AppConstants.DeleteEndpoint)]
        public IActionResult Delete([FromQuery] string name, [FromQuery] bool isDirectory = false)
        {
            var fullPath = Path.Combine(_homeDirectory, name);

            if (isDirectory)
            {
                if (!Directory.Exists(fullPath))
                {
                    return NotFound(AppConstants.DirectoryNotFoundMessage);
                }

                Directory.Delete(fullPath, true);
                return Ok(AppConstants.DirectoryDeletedMessage);
            }
            else
            {
                if (!System.IO.File.Exists(fullPath))
                {
                    return NotFound(AppConstants.FileNotFoundMessage);
                }

                System.IO.File.Delete(fullPath);
                return Ok(AppConstants.FileDeletedMessage);
            }
        }
    }
}