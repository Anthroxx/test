// Simulador de Entorno de Desarrollo Interactivo de Spring Boot (Mock IDE)
document.addEventListener('DOMContentLoaded', () => {
    // Archivos iniciales
    const files = {
        'HelloController.java': `package com.example.demo;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
public class HelloController {

    @GetMapping("/hola")
    public String decirHola(@RequestParam(value = "nombre", defaultValue = "Mundo") String nombre) {
        return "¡Hola, " + nombre + "! Bienvenido a Spring Boot interactivo.";
    }

    @GetMapping("/")
    public String inicio() {
        return "Servidor Spring Boot funcionando correctamente. Navega a /hola";
    }
}`,
        'DemoApplication.java': `package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}`,
        'application.properties': `# Configuración de la aplicación
server.port=8080
spring.application.name=tutorial-spring-boot
logging.level.org.springframework=INFO
`
    };

    let activeFile = 'HelloController.java';
    let isServerRunning = false;
    let isServerStarting = false;
    let startupTimeout = null;

    const tabContainer = document.getElementById('editor-tabs');
    const textarea = document.getElementById('editor-textarea');
    const lineNumbers = document.getElementById('editor-line-numbers');
    const btnRun = document.getElementById('btn-run');
    const consoleLogs = document.getElementById('console-logs');
    const browserBody = document.getElementById('browser-body');
    const browserAddress = document.getElementById('browser-address');

    // Inicializar pestañas
    function initTabs() {
        if (!tabContainer) return;
        tabContainer.innerHTML = '';
        Object.keys(files).forEach(filename => {
            const button = document.createElement('button');
            button.className = `editor-tab ${filename === activeFile ? 'active' : ''}`;
            button.innerHTML = `📄 ${filename}`;
            button.addEventListener('click', () => selectFile(filename));
            tabContainer.appendChild(button);
        });
    }

    // Seleccionar archivo
    function selectFile(filename) {
        // Guardar el código actual
        if (textarea) {
            files[activeFile] = textarea.value;
        }
        activeFile = filename;
        initTabs();
        if (textarea) {
            textarea.value = files[activeFile];
            updateLineNumbers();
        }
    }

    // Actualizar números de línea
    function updateLineNumbers() {
        if (!textarea || !lineNumbers) return;
        const lines = textarea.value.split('\n').length;
        let numbersHtml = '';
        for (let i = 1; i <= lines; i++) {
            numbersHtml += `<div>${i}</div>`;
        }
        lineNumbers.innerHTML = numbersHtml;
    }

    if (textarea) {
        textarea.addEventListener('input', updateLineNumbers);
        textarea.addEventListener('keydown', (e) => {
            // Permitir indentar con tabulador
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + 4;
                updateLineNumbers();
            }
        });
    }

    // Logs del sistema Spring Boot simulados
    const springBanner = `
  .   ____          _            __ _ _
 /\\\\ / ___'_ __ _ _(_)_ __  __ _ \\ \\ \\ \\
( ( )\\___ | '_ | '_| | '_ \\/ _\` | \\ \\ \\ \\
 \\\\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.2)
`;

    function appendLog(message, type = 'info') {
        if (!consoleLogs) return;
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const prefix = `${timestamp}  ${type.toUpperCase()} 23512 --- [           main] `;
        consoleLogs.innerHTML += `\n${prefix} : ${message}`;
        consoleLogs.scrollTop = consoleLogs.scrollHeight;
    }

    // Iniciar servidor simulado
    function startServer() {
        if (isServerRunning || isServerStarting) return;
        isServerStarting = true;
        btnRun.innerText = 'Detener';
        btnRun.classList.remove('btn-primary');
        btnRun.classList.add('btn-secondary');
        
        if (consoleLogs) {
            consoleLogs.innerHTML = springBanner;
            consoleLogs.scrollTop = consoleLogs.scrollHeight;
        }

        setTimeout(() => appendLog('Starting DemoApplication using Java 21.0.10...', 'info'), 200);
        setTimeout(() => appendLog('No active profile set, falling back to 1 default profile: "default"', 'info'), 400);
        setTimeout(() => appendLog('DevTools property defaults active! Set "spring.devtools.add-properties" to false to disable', 'info'), 600);
        setTimeout(() => appendLog('Tomcat initialized with port(s): 8080 (http)', 'info'), 900);
        setTimeout(() => appendLog('Initializing Servlet: \'dispatcherServlet\'', 'info'), 1100);
        setTimeout(() => appendLog('Initializing Spring Framework Servlet \'dispatcherServlet\'', 'info'), 1200);
        setTimeout(() => appendLog('Completed initialization in 12 ms', 'info'), 1250);
        
        startupTimeout = setTimeout(() => {
            isServerStarting = false;
            isServerRunning = true;
            appendLog('Started DemoApplication in 1.842 seconds (JVM running for 2.311)', 'info');
            updateBrowserPreview();
        }, 1500);
    }

    // Detener servidor simulado
    function stopServer() {
        if (!isServerRunning && !isServerStarting) return;
        clearTimeout(startupTimeout);
        isServerStarting = false;
        isServerRunning = false;
        btnRun.innerText = 'Ejecutar';
        btnRun.classList.remove('btn-secondary');
        btnRun.classList.add('btn-primary');
        
        if (consoleLogs) {
            appendLog('Shutting down Spring Boot Application...', 'info');
            appendLog('Closing Spring ApplicationContext (org.springframework.context.annotation.AnnotationConfigApplicationContext)', 'info');
            appendLog('Stopping Tomcat service...', 'info');
            appendLog('Tomcat server stopped successfully.', 'info');
        }
        updateBrowserPreview();
    }

    if (btnRun) {
        btnRun.addEventListener('click', () => {
            if (isServerRunning || isServerStarting) {
                stopServer();
            } else {
                startServer();
            }
        });
    }

    // Analizador de código de HelloController.java
    function parseControllerCode() {
        // Obtenemos el último código en memoria para HelloController.java
        let code = files['HelloController.java'];
        if (activeFile === 'HelloController.java' && textarea) {
            code = textarea.value;
        }

        // Buscar mapeos
        const mappings = [];
        
        // Expresión regular mejorada para capturar annotations y métodos
        // Busca GetMapping con su path, y el método Java correspondiente
        const getMappingRegex = /@GetMapping\(\s*"([^"]+)"\s*\)\s*public\s+String\s+(\w+)\s*\((?:[^()]*|\([^()]*\))*\)\s*\{([^}]+)\}/g;
        let match;
        
        while ((match = getMappingRegex.exec(code)) !== null) {
            const path = match[1];
            const methodName = match[2];
            const body = match[3];
            
            // Extraer la cadena de retorno return "algo";
            const returnRegex = /return\s+"([^"]+)"\s*(\+|\s|nombre)/;
            const returnMatch = body.match(/return\s+"([^"]+)"/);
            const returnVal = returnMatch ? returnMatch[1] : '';

            mappings.push({
                type: 'GET',
                path: path,
                method: methodName,
                returnValue: returnVal,
                hasRequestParam: body.includes('nombre') || code.includes('@RequestParam')
            });
        }

        return mappings;
    }

    // Actualizar vista del navegador simulado
    function updateBrowserPreview() {
        if (!browserBody || !browserAddress) return;

        if (!isServerRunning) {
            browserBody.className = 'browser-body browser-body-offline';
            browserBody.innerHTML = `
                <div style="text-align: center; color: #64748b;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🔌</div>
                    <h3 style="color: #94a3b8; margin: 10px 0;">Servidor Fuera de Línea</h3>
                    <p style="font-size: 13px;">Haz clic en el botón verde <strong>"Ejecutar"</strong> para iniciar el servidor de desarrollo Spring Boot.</p>
                </div>
            `;
            return;
        }

        const url = browserAddress.value.trim();
        let pathname = '/';
        try {
            if (url.startsWith('http://localhost:8080')) {
                pathname = url.substring('http://localhost:8080'.length);
            } else if (url.startsWith('localhost:8080')) {
                pathname = url.substring('localhost:8080'.length);
            } else {
                pathname = url;
            }
        } catch(e) {
            pathname = '/';
        }

        // Si no tiene barra inicial, ponérsela
        if (!pathname.startsWith('/')) {
            pathname = '/' + pathname;
        }

        // Limpiar parámetros para buscar el endpoint de mapeo
        const queryIdx = pathname.indexOf('?');
        let basePath = queryIdx !== -1 ? pathname.substring(0, queryIdx) : pathname;
        let queryParams = {};
        
        if (queryIdx !== -1) {
            const queryStr = pathname.substring(queryIdx + 1);
            queryStr.split('&').forEach(param => {
                const parts = param.split('=');
                if (parts[0]) {
                    queryParams[parts[0]] = decodeURIComponent(parts[1] || '');
                }
            });
        }

        // Parsear mappings del código
        const mappings = parseControllerCode();
        const route = mappings.find(m => m.path === basePath);

        browserBody.className = 'browser-body';
        browserBody.style.backgroundColor = '#ffffff';
        browserBody.style.color = '#1e293b';

        if (route) {
            let responseText = route.returnValue;
            
            // Simular el comportamiento del parámetro request
            if (route.hasRequestParam) {
                const nombre = queryParams['nombre'] || 'Mundo';
                responseText = `¡Hola, ${nombre}! Bienvenido a Spring Boot interactivo.`;
                
                // Si el usuario modificó drásticamente el return, intentamos respetar su modificación
                if (!route.returnValue.includes('Hola')) {
                    responseText = route.returnValue.replace('nombre', nombre).replace('World', nombre).replace('Mundo', nombre);
                }
            }

            browserBody.innerHTML = `
                <div style="padding: 20px; font-family: sans-serif; text-align: left; width: 100%;">
                    <div style="border-bottom: 2px solid #10b981; padding-bottom: 10px; margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-weight: bold; color: #0f172a; font-size: 14px;">Spring MVC API Endpoint Response</span>
                        <span style="background-color: #d1fae5; color: #065f46; font-size: 10px; padding: 2px 8px; border-radius: 20px; font-weight: bold;">Status: 200 OK</span>
                    </div>
                    <div style="font-size: 18px; color: #334155; font-family: monospace; word-break: break-all; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px dashed #cbd5e1;">
                        ${responseText}
                    </div>
                    <div style="margin-top: 15px; font-size: 12px; color: #64748b;">
                        Método Java mapeado: <code style="color: #0284c7; background: #f1f5f9; padding: 2px 4px; border-radius: 3px;">${route.method}()</code>
                    </div>
                </div>
            `;
            
            appendLog(`Mapeo GET HTTP atendido correctamente para ruta: ${basePath}`, 'info');
        } else {
            // White label error page (error clásico de Spring)
            browserBody.innerHTML = `
                <div style="padding: 30px; font-family: sans-serif; text-align: left; color: #000; width: 100%;">
                    <h1 style="color: #000; font-size: 22px; font-family: sans-serif; margin-bottom: 10px; border-left: none; padding-left: 0;">Whitelabel Error Page</h1>
                    <p style="color: #000; font-size: 14px; margin-bottom: 15px;">This application has no explicit mapping for /error, so you are seeing this as a fallback.</p>
                    <div style="font-size: 13px; margin-bottom: 20px;">${new Date().toString()}</div>
                    <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">There was an unexpected error (type=Not Found, status=404).</div>
                    <div style="font-size: 13px; color: #555;">No message available</div>
                    <hr style="border: 0; border-top: 1px solid #aaa; margin: 20px 0;">
                    <p style="font-size: 12px; color: #555;">Sugerencia: Cambia la URL en la barra de navegación a <code style="font-family: monospace; background: #eee; padding: 2px 4px;">http://localhost:8080/hola</code> o a <code style="font-family: monospace; background: #eee; padding: 2px 4px;">http://localhost:8080/hola?nombre=Carlos</code></p>
                </div>
            `;
            appendLog(`Mapeo GET HTTP falló (404 Not Found) para ruta: ${basePath}`, 'warn');
        }
    }

    if (browserAddress) {
        browserAddress.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                updateBrowserPreview();
            }
        });
    }

    // Inicializar editor al arrancar
    initTabs();
    if (textarea) {
        textarea.value = files[activeFile];
        updateLineNumbers();
    }
});
