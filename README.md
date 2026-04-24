# DocReady — Backend (API)

The Spring Boot REST API that powers **DocReady**. It parses `.docx` and `.pdf` documents, computes structural metrics, and uses **Google Gemini** (with a deterministic heuristic fallback) to produce migration-readiness analysis.

> See the [root README](../README.md) for the full project overview and the [`../frontend`](../frontend) folder for the React UI.

---

## 🛠 Tech Stack

| Library | Purpose |
|---|---|
| **Spring Boot 3.2.5** | REST framework, DI, config |
| **Java 17** | Language |
| **Apache POI 5.2.5** | `.docx` parsing (text + headings + tables + images) |
| **Apache PDFBox 3.0.2** | `.pdf` text extraction + page count |
| **Spring WebFlux (WebClient)** | Async HTTP calls to Gemini API |
| **Lombok** | Boilerplate reduction (`@Data`, `@Builder`, `@RequiredArgsConstructor`) |
| **Jackson** | JSON serialization / deserialization |
| **Spring DevTools** | Hot-reload during development |

---

## 📦 Prerequisites

- **Java 17+** — `java -version`
- **Maven 3.9+** (or use the bundled wrapper `./mvnw` / `mvnw.cmd`)
- **Google Gemini API key** — get one free at https://aistudio.google.com/apikey

---

## 🚀 Quick Start

### 1. Set the Gemini API key

**Windows (PowerShell)** — current session:
```powershell
$env:GEMINI_API_KEY="YOUR_KEY_HERE"
```

**Persistent (per Windows user)**:
```powershell
[Environment]::SetEnvironmentVariable("GEMINI_API_KEY","YOUR_KEY_HERE","User")
```

**macOS / Linux**:
```bash
export GEMINI_API_KEY="YOUR_KEY_HERE"
```

> If unset, the API still works using the deterministic heuristic analyzer; the UI's AI toggle becomes disabled.

### 2. Run the server

```bash
cd backend
mvn spring-boot:run
```

Server boots on **http://localhost:8080**. Verify:

```bash
curl http://localhost:8080/api/health
# {"status":"UP","service":"doc-migration-tool"}
```

---

## 📜 Available Maven Commands

| Command | Description |
|---|---|
| `mvn spring-boot:run` | Start dev server with hot-reload |
| `mvn clean compile` | Compile sources |
| `mvn package` | Build executable JAR → `target/tool-1.0.0.jar` |
| `java -jar target/tool-1.0.0.jar` | Run the packaged JAR |

---

## 🌐 REST API

### `GET /api/health`
Liveness check.
```json
{ "status": "UP", "service": "doc-migration-tool" }
```

### `GET /api/settings`
Discover Gemini configuration and the available model list (drives the UI's model picker).
```json
{
  "geminiConfigured": true,
  "geminiEnabledByDefault": true,
  "defaultModel": "gemini-2.5-flash-lite",
  "availableModels": [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
    "gemini-flash-latest"
  ]
}
```

### `POST /api/analyze`
Multipart upload + analysis.

| Param | Type | Required | Description |
|---|---|---|---|
| `file` | file | ✅ | `.docx` or `.pdf`, max 20 MB |
| `useAi` | boolean | ❌ | Override server default. `true` = call Gemini, `false` = heuristic |
| `model` | string | ❌ | Must be one of `availableModels`. Defaults to `defaultModel` |

Sample:
```bash
curl -X POST "http://localhost:8080/api/analyze?useAi=true&model=gemini-2.5-flash-lite" \
  -F "file=@../samples/input/sample.pdf"
```

Response includes `metrics`, `structure`, `aiAnalysis`, `verdict`, `analyzer` (`gemini` / `heuristic`), and `model`. See [`samples/output/sample-output.json`](../samples/output/sample-output.json).

---

## 🗂 Project Structure

```
backend/
├── src/main/java/com/migration/tool/
│   ├── MigrationToolApplication.java       # @SpringBootApplication entry point
│   ├── config/
│   │   ├── GeminiConfig.java               # @ConfigurationProperties + WebClient bean
│   │   └── WebConfig.java                  # CORS for localhost:5173
│   ├── controller/
│   │   └── AnalysisController.java         # /api endpoints
│   ├── exception/
│   │   └── GlobalExceptionHandler.java     # @RestControllerAdvice — uniform error JSON
│   ├── model/
│   │   ├── AnalysisResponse.java           # full payload returned to client
│   │   ├── ParsedDocument.java             # raw text + metadata after parse
│   │   ├── DocumentMetrics.java            # words, pages, headings, ...
│   │   ├── DocumentStructure.java          # hierarchy, orphans, long paras
│   │   ├── HeadingNode.java                # tree node (level, text)
│   │   ├── AiAnalysis.java                 # readability, scores, summary, suggestions
│   │   └── Verdict.java                    # ready flag + confidence + one-liner
│   └── service/
│       ├── DocumentParserService.java      # dispatches by content-type to docx/pdf
│       ├── DocxParserService.java          # Apache POI: paragraphs, headings, tables
│       ├── PdfParserService.java           # PDFBox: text + page count
│       ├── MetricsService.java             # computes DocumentMetrics
│       ├── StructureAnalysisService.java   # builds DocumentStructure + heading tree
│       └── GeminiAnalysisService.java      # WebClient → Gemini, heuristic fallback
├── src/main/resources/
│   └── application.yml                     # server port, multipart, gemini config
└── pom.xml
```

---

## 🧠 How the Pipeline Works

```
┌──────────────────┐
│  POST /analyze   │  multipart upload
└────────┬─────────┘
         ▼
┌──────────────────────┐
│ DocumentParserService│  → DocxParserService | PdfParserService
└────────┬─────────────┘
         ▼  ParsedDocument (fullText, headings, tables, images, …)
┌──────────────────────┐
│   MetricsService     │  → DocumentMetrics (words, pages, avg/para, …)
└────────┬─────────────┘
         ▼
┌──────────────────────────┐
│ StructureAnalysisService │  → DocumentStructure (hierarchy, orphans, long paras)
└────────┬─────────────────┘
         ▼
┌──────────────────────────┐
│  GeminiAnalysisService   │  if useAi && key set → call Gemini
│                          │  else / on failure   → heuristicFallback()
└────────┬─────────────────┘
         ▼  AiAnalysis + analyzer + model used
┌──────────────────┐
│ AnalysisResponse │  JSON to client
└──────────────────┘
```

---

## ⚙️ Configuration

[`src/main/resources/application.yml`](src/main/resources/application.yml):

```yaml
server:
  port: 8080

spring:
  servlet:
    multipart:
      max-file-size: 20MB
      max-request-size: 20MB

gemini:
  api-key: ${GEMINI_API_KEY:}      # from env var
  model: gemini-2.5-flash-lite     # default model
  endpoint: https://generativelanguage.googleapis.com/v1beta/models
  enabled: true                    # default UI toggle state
  max-input-chars: 30000           # truncate doc text before sending to Gemini
  timeout-seconds: 60
  available-models:                # surfaced in UI dropdown
    - gemini-2.5-flash-lite
    - gemini-2.5-flash
    - gemini-2.5-pro
    - gemini-2.0-flash-lite
    - gemini-2.0-flash
    - gemini-flash-latest
```

All keys can also be overridden via env vars (e.g. `GEMINI_MODEL`, `GEMINI_TIMEOUT_SECONDS`) thanks to Spring Boot's relaxed binding.

---

## 🛡 Edge Cases Handled

| Case | Behavior |
|---|---|
| Empty file | `400 Bad Request` with clear message |
| Unsupported file type | Rejected before parsing |
| Large documents (> `max-input-chars`) | AI input truncated; full-text metrics still computed |
| Inconsistent heading hierarchy | Flagged in `structure.hasConsistentHierarchy = false` and surfaced in `aiAnalysis.issues` |
| Gemini quota exceeded (HTTP 429) | Auto-fallback to heuristic; response sets `analyzer = "heuristic"` and `aiAnalysis.summary` explains *"Gemini quota exceeded (HTTP 429)"* |
| Invalid model name (HTTP 404) | Same fallback with the underlying error in summary |
| Network failure / connection reset | Same fallback path |
| Missing API key | All requests routed to heuristic; `/api/settings` reports `geminiConfigured: false` |
| Malformed Gemini response | JSON-parse failure caught; heuristic fallback used |

---

## 🐛 Troubleshooting

| Symptom | Cause / Fix |
|---|---|
| `Failed to execute goal spring-boot-maven-plugin:run` | Port 8080 already in use. `Get-NetTCPConnection -LocalPort 8080` then `Stop-Process -Id <PID>` |
| `mvn` not found | Use the bundled wrapper: `./mvnw spring-boot:run` (or `.\mvnw.cmd` on Windows) |
| Logs show `404 Not Found from POST .../models/<name>:generateContent` | Model not enabled for your key — check `/api/settings` for `availableModels` |
| Logs show `429 Too Many Requests` | Free-tier quota hit. Switch to `gemini-2.5-flash-lite` (highest free quota) in the UI |
| Devtools didn't pick up a change | Run `mvn -q compile` in another terminal to force a class-path event |
| `No static resource api/settings.` | You're hitting the running JAR before the new endpoint was loaded — restart the server |

---

## 🧪 Manual Testing

```bash
# 1. Health
curl http://localhost:8080/api/health

# 2. Settings (model list)
curl http://localhost:8080/api/settings

# 3. Analyze with heuristic only
curl -X POST "http://localhost:8080/api/analyze?useAi=false" \
  -F "file=@../samples/input/sample.pdf"

# 4. Analyze with Gemini
curl -X POST "http://localhost:8080/api/analyze?useAi=true&model=gemini-2.5-flash-lite" \
  -F "file=@../samples/input/sample.pdf" | jq .
```

---

## 📜 License

For evaluation / take-home assignment purposes.
