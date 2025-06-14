# Islamic Stock Morality Scorer

This tool evaluates stocks based on Islamic principles and ethical considerations, providing a morality score, a detailed analysis, and a Sharia compliance check.

## Features

- Evaluates stocks based on:
  - Connections to Israel
  - Military-industrial complex connections
  - Sharia compliance factors
  - Environmental Impact
  - Other Ethical Concerns (e.g., labor practices, data privacy)
- Uses a two-step AI process:
  1.  **Data Gathering**: AI researches the company to find relevant data across all categories.
  2.  **Evaluation**: A second AI model scores the company based on the gathered data.
- Provides a clear, boolean `is_sharia_compliant` status.
- RESTful API for easy integration with frontends.

## Setup

1.  Clone this repository.
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  The application uses an API key for the OpenRouter service, which is currently hardcoded in `ERank/stock_scorer.py`. For production use, it's recommended to manage this key securely, for example, using environment variables.

## Usage

### Running the API

Start the API server from the root directory of the project:
```bash
python -m ERank.api
```

The API will be available at `http://localhost:8000`.

### API Endpoints

#### Evaluate a Stock

`POST /evaluate`

This endpoint triggers the two-step AI evaluation process. It may take a few moments to complete as it performs real-time data gathering and analysis.

**Request body:**
```json
{
    "company_name": "Apple Inc."
}
```

**Response:**
```json
{
    "company_name": "Apple Inc.",
    "israel_connections": {
        "some_factor": 0.5,
        "...": "..."
    },
    "military_connections": {
        "some_factor": 0.8,
        "...": "..."
    },
    "sharia_compliance": {
        "some_factor": 1.0,
        "...": "..."
    },
    "environmental_impact": {
        "some_factor": 0.6,
        "...": "..."
    },
    "other_ethical_concerns": {
        "some_factor": 0.4,
        "...": "..."
    },
    "overall_score": 0.65,
    "is_sharia_compliant": true,
    "analysis": "A detailed analysis of the company's ethical standing..."
}
```

## Scoring Criteria

The tool gathers data and scores stocks based on five main categories:

1.  **Israel Connections**
2.  **Military-Industrial Complex Connections**
3.  **Sharia Compliance**
4.  **Environmental Impact**
5.  **Other Ethical Concerns**

Each category is analyzed, and the findings are used to generate a final ethics score and compliance status.

## Contributing

Feel free to submit issues and enhancement requests! 