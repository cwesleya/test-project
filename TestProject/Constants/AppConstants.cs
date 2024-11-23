namespace TestProject.Constants
{
    public static class AppConstants
    {
        // Default file directory key (matches appsettings.json key)
        public const string DefaultRootDirectoryKey = "HomeDirectory";

        // API Endpoints
        public const string ApiRouteBase = "api/test";
        public const string BrowseEndpoint = "browse";
        public const string SearchEndpoint = "search";
        public const string UploadEndpoint = "upload";
        public const string DownloadEndpoint = "download";
        public const string StatsEndpoint = "stats";

        // Error Messages
        public const string DirectoryNotFoundMessage = "Directory not found.";
        public const string FileNotFoundMessage = "File not found.";
        public const string FileUploadedSuccessfully = "File uploaded successfully!";

        // Miscellaneous
        public const string DefaultContentType = "application/octet-stream";
        public const int DefaultPageSize = 25;
    }
}