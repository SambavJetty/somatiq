# Tiptap Autocomplete with FastAPI and Firebase Auth

This project demonstrates a text-based autocomplete feature integrated into a Tiptap editor (frontend) with a FastAPI backend, secured using Firebase Authentication.

## Setup Steps

### 1. env Setup

1.  Create an env file in the root of your frontend directory and give the values

        \`\`\`
        NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
        NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
        NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"

### 2. Backend Setup (FastAPI)

1.  Navigate to the `api/` directory in backend folder:
    \`\`\`bash
    cd api
    \`\`\`
2.  Create a Python virtual environment (recommended):
    \`\`\`bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    \`\`\`
3.  Install the required Python packages:
    \`\`\`bash
    pip install -r requirements.txt
    \`\`\`
4.  Set the environment variable for the Firebase service account path. Replace `path/to/your/firebase_service_account.json` with the actual path to the file you downloaded and placed in the `api/` directory.
    \`\`\`bash
    export FIREBASE_SERVICE_ACCOUNT_PATH="./firebase_service_account.json"
    \`\`\`
5.  Run the FastAPI application:
    \`\`\`bash
    uvicorn main:app --reload
    \`\`\`
    The API will be running at `http://localhost:8000`.

### 3. Frontend Setup (Next.js)

1.  Navigate back to the root directory of the project (where `app/` is):
    \`\`\`bash
    cd ..
    \`\`\`
2.  Install Node.js dependencies:
    \`\`\`bash
    npm install
    # or yarn install
    \`\`\`
3.  Run the Next.js development server:
    \`\`\`bash
    npm run dev
    # or yarn dev
    \`\`\`
    The frontend will be running at `http://localhost:3000`.

## API Usage

The backend provides the following endpoint:

*   **GET `/autocomplete?query=word`**
    *   **Description:** Returns a list of matching suggestions based on the provided `query`.
    *   **Authentication:** Requires a Firebase ID token in the `Authorization` header (e.g., `Authorization: Bearer <ID_TOKEN>`).
    *   **Example Request (from frontend):**
        \`\`\`javascript
        fetch('http://localhost:8000/autocomplete?query=Sagittal', {
          headers: {
            'Authorization': 'Bearer YOUR_FIREBASE_ID_TOKEN'
          }
        })
        .then(response => response.json())
        .then(data => console.log(data.suggestions));
        \`\`\`
    *   **Example Response:**
        \`\`\`json
        {
          "suggestions": [
            "Sagittal and Axial T1 and T2 W sequences",
            "Screening sagittal T1W sequence through cervico-dorsal spine"
          ]
        }
        \`\`\`

## Demo Video link

https://www.loom.com/share/7978541050c34f4493c62b024ae85f3c