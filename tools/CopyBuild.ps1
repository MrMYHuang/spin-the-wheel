Set-Location .\spin-the-wheel-pwa\
Get-Item * -Exclude .git | Remove-Item -Recurse
Copy-Item -Recurse ..\build\* . 
Copy-Item -Recurse ..\build\.nojekyll . 
