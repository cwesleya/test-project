# Use the official ASP.NET Core runtime as a parent image
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Use the official ASP.NET Core build image as a parent image
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["TestProject/TestProject.csproj", "TestProject/"]
RUN dotnet restore "TestProject/TestProject.csproj"
COPY . .
WORKDIR "/src/TestProject"
RUN dotnet build "TestProject.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "TestProject.csproj" -c Release -o /app/publish

# Use the runtime image to run the application
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Set the entrypoint to use the specified launch profile
ENTRYPOINT ["dotnet", "run", "--launch-profile", "Development"]

# Example usage:
# docker build -t testproject .
# docker run -p 8080:80 testproject
# FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
# WORKDIR /app
# EXPOSE 80

# FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
# WORKDIR /src
# COPY ["TestProject/TestProject.csproj", "TestProject/"]
# RUN dotnet restore "TestProject/TestProject.csproj"
# COPY . .
# WORKDIR "/src/TestProject"
# RUN dotnet build "TestProject.csproj" -c Release -o /app/build

# FROM build AS publish
# RUN dotnet publish "TestProject.csproj" -c Release -o /app/publish

# FROM base AS final
# WORKDIR /app
# COPY --from=publish /app/publish .

# # Default to WORKDIR
# ENV HomeDirectory=/app
# # Default to Development environment
# ENV ASPNETCORE_ENVIRONMENT=Development
# # Use a shell command to set HomeDirectory to the value passed in at docker run or default to the WORKDIR
# ENTRYPOINT ["sh", "-c", "export HomeDirectory=${HomeDirectory:-/app} && ASPNETCORE_ENVIRONMENT=${ASPNETCORE_ENVIRONMENT:-/app} && exec dotnet TestProject.dll"]

# # Run with a custom HomeDirectory
# docker run -e HomeDirectory=/custom/path -p 8080:80 testproject

# # Run with the default HomeDirectory (WORKDIR)
# docker run -p 8080:80 testproject


# command line with VS code outside of docker
#export ASPNETCORE_ENVIRONMENT=Development
#export HomeDirectory=/path/to/home/directory
#dotnet build
#dotnet run

# Visual Studio

# To configure the `HomeDirectory` value when running with Visual Studio, you can set environment variables in the project properties. Here are the steps to do this:

#     ### Steps to Configure Environment Variables in Visual Studio
    
#     1. **Open Project Properties:**
#        - Right-click on your project in Solution Explorer and select "Properties".
    
#     2. **Go to the Debug Tab:**
#        - In the project properties window, navigate to the "Debug" tab.
    
#     3. **Add Environment Variables:**
#        - In the "Environment variables" section, click on the "Add" button.
#        - Add a new environment variable with the following details:
#          - **Name:** `HomeDirectory`
#          - **Value:** `/path/to/home/directory` (replace with your actual directory path)
    
#     4. **Save and Run:**
#        - Save the changes and run your project. Visual Studio will now use the specified environment variable.
    