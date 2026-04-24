# Sample Input

Place sample documents here for testing.

The repository expects at least one of:
- `sample.docx`
- `sample.pdf`

> **Note**: Real document samples were used during development (e.g., the assignment PDF and an Inventory Warehouse Management PDF) but are not committed to keep the repo small. Drop your own `.docx` or `.pdf` here and run:
>
> ```bash
> curl -X POST "http://localhost:8080/api/analyze?useAi=true" \
>   -F "file=@samples/input/your-document.pdf" \
>   -o samples/output/your-document-output.json
> ```
