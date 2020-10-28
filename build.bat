@ECHO OFF
SETLOCAL
SET folder=dist
SET msg=Complete

IF NOT EXIST .\%folder%\ (
	MKDIR .\%folder%\
)
ECHO Clearing "%folder%" folder...
CALL DEL /q .\%folder%\*

WHERE /Q uglifyjs
IF %ERRORLEVEL% NEQ 0 (
	SET msg=uglify-js is not installed. Install and add it to the %%PATH%% variable
	GOTO END
)

ECHO Compressing JS files...
CALL uglifyjs .\src\accordion.js --output .\%folder%\accordion.min.js

:END
ECHO %msg%
EXIT /B %ERRORLEVEL%
