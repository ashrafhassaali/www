$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# محاولة استخدام بورت 8000، وإذا كان مشغولاً يتم تجربة بورت آخر متاح تلقائياً
$port = 8000
$listener = $null

while ($port -lt 8015) {
    try {
        $testListener = New-Object System.Net.HttpListener
        $testListener.Prefixes.Add("http://localhost:$port/")
        $testListener.Start()
        $testListener.Stop()
        break # البورت متاح، نخرج من الحلقة
    }
    catch {
        $port++ # البورت مشغول، نجرب البورت اللي بعده
    }
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()

    Write-Host ""
    Write-Host "===================================="
    Write-Host " Task Manager Server Started"
    Write-Host "===================================="
    Write-Host ""
    Write-Host "http://localhost:$port/TaskManager.html"
    Write-Host ""
    
    Start-Process "http://localhost:$port/TaskManager.html"

}
catch {
    Write-Host ""
    Write-Host "ERROR:"
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "اضغط Enter للخروج..."
    Read-Host
    exit
}


while ($listener.IsListening) {

    try {

        $context = $listener.GetContext()

        $urlPath = $context.Request.Url.AbsolutePath

        if ($urlPath -eq "/") {
            $urlPath = "/TaskManager.html"
        }

        $relativePath = $urlPath.TrimStart("/") -replace "/", "\"

        $filePath = Join-Path $root $relativePath

        if (Test-Path $filePath -PathType Leaf) {

            $bytes = [System.IO.File]::ReadAllBytes($filePath)

            $extension =
                [System.IO.Path]::GetExtension($filePath).ToLower()

            switch ($extension) {

                ".html" {
                    $contentType = "text/html; charset=utf-8"
                }

                ".css" {
                    $contentType = "text/css; charset=utf-8"
                }

                ".js" {
                    $contentType = "application/javascript; charset=utf-8"
                }

                ".png" {
                    $contentType = "image/png"
                }

                ".jpg" {
                    $contentType = "image/jpeg"
                }

                ".jpeg" {
                    $contentType = "image/jpeg"
                }

                ".gif" {
                    $contentType = "image/gif"
                }

                ".ico" {
                    $contentType = "image/x-icon"
                }

                default {
                    $contentType = "application/octet-stream"
                }
            }

            $context.Response.ContentType = $contentType
            $context.Response.ContentLength64 = $bytes.Length

            $context.Response.OutputStream.Write(
                $bytes,
                0,
                $bytes.Length
            )

        }
        else {

            $context.Response.StatusCode = 404

            $bytes = [System.Text.Encoding]::UTF8.GetBytes(
                "404 - File Not Found"
            )

            $context.Response.OutputStream.Write(
                $bytes,
                0,
                $bytes.Length
            )
        }

        $context.Response.OutputStream.Close()
        $context.Response.Close()

    }
    catch {

        Write-Host "Request Error:"
        Write-Host $_.Exception.Message
    }
}