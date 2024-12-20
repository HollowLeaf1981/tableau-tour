# Tableau Tour

The Tableau Tour Extension is a powerful tool designed to enhance user engagement and streamline the onboarding process within Tableau dashboards. By offering interactive, step-by-step guided tours, it helps both new and experienced users navigate complex data visualizations with ease. Key features include customizable tour steps that highlight essential dashboard elements using semi-transparent grey overlay boxes, ensuring focused attention on important data points. Informative tooltips provide contextual explanations directly within the dashboard, while intuitive navigation controls like forward and back arrows, along with clickable step indicators, allow users to effortlessly move through the tour. Additionally, a user-friendly configuration dialog enables administrators to easily add, modify, or remove tour steps, as well as adjust global settings such as fonts, background colors, and transparency levels to align with the dashboard’s design aesthetics.

The extension offers numerous benefits, including accelerated learning curves for new users, increased engagement through interactive elements, and improved data comprehension by providing contextual insights. Its responsive design ensures compatibility across various devices and screen sizes, maintaining consistent alignment and functionality. Ideal for onboarding new employees, conducting training sessions, or highlighting new features, the Tableau Tour Extension seamlessly integrates with existing dashboards using Tableau’s Extensions API without requiring advanced programming knowledge. This flexibility allows organizations to create tailored tour experiences that enhance the overall effectiveness and usability of their Tableau dashboards, fostering a deeper understanding and more informed decision-making across teams.

## Prerequisites

Before running this project, ensure you have the following installed:

- Node.js (Latest LTS recommended)
- Git
- A Tableau environment to test the extension

## Installation

1. Clone the repository: `git clone https://github.com/HollowLeaf1981/tableau-tour`

2. Navigate to the project directory:

   ```bash
    cd tableau_tour
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

## Running the Application

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173 ` to see the application.

3. Follow the steps below to load this extension into Tableau:

- Open Tableau Desktop.
- Add an Extension object to your dashboard.
- Choose to load the extension from a local file and select the manifest.trex from the project.

## Project Structure

```
.
├── public
│   ├── js
│   │   └── tableau.extensions.1.12.0.min.js     # Tableau Extension Library
├── src
│   ├── Configure.jsx      # Component for the configuration dialog
│   ├── App.jsx            # Main application logic
│   ├── index.css          # Style Sheet
│   └── main.jsx           # Application entry point
├── package.json
└── index.html             # Main entry point for the extension
```

## How It Works

### App.jsx

The main application initializes the Tableau Extensions API, retrieves saved settings, and displays the configuration dialog.

### Configure.jsx

Handles the configuration logic. Users can input settings in a dialog, save them, and close the dialog, which triggers an update in the main application.

## Configuration Flow

1. The user clicks a button to open the configuration dialog.
2. The dialog loads a separate page where the user can set preferences.
3. The settings are saved using the Tableau Extensions API.
4. The main application updates to reflect the new settings.

## Example Usage

1. Open Tableau Desktop and add an extension object to your dashboard.
2. Load the extension from the local directory.
3. Interact with the configuration dialog to customize settings.
4. See the changes reflected in the Tableau dashboard.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

### Author

Developed by Toan Hoang. For more projects and updates, visit [HollowLeaf1981 on GitHub](https://github.com/HollowLeaf1981).

If you encounter any issues or have suggestions for improvement, feel free to create an issue or submit a pull request.
