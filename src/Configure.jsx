// Import necessary React hooks and Material-UI components
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  IconButton,
  MenuItem,
  Select,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";

// Import Material-UI icons for various actions
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

// Import ChromePicker from react-color for color selection
import { ChromePicker } from "react-color";

/**
 * TabPanel component to manage the content of each tab.
 * It renders its children only when the current tab value matches its index.
 */
function TabPanel(props) {
  // Destructure props to extract children, value, and index
  // eslint-disable-next-line react/prop-types
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index} // Hide the panel if it's not the active tab
      {...other}
      sx={{ flex: 1, overflowY: "auto" }} // Allow the panel to grow and scroll if content overflows
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}{" "}
      {/* Render children with padding if active */}
    </Box>
  );
}

/**
 * Configure component serves as a dialog for configuring tour settings.
 * Users can select fonts, background colors, transparency levels, and manage tour items.
 */
const Configure = () => {
  // State to manage the list of tour items (rows)
  const [rows, setRows] = useState([]);

  // State to hold available dashboard objects fetched from Tableau
  const [dashboardObjects, setDashboardObjects] = useState([]);

  // State to track the currently active tab (0: General, 1: Tour Items)
  const [tabValue, setTabValue] = useState(0);

  // State to manage the selected font; default is "Roboto"
  const [selectedFont, setSelectedFont] = useState("Roboto");

  // State to manage the selected background color; default is light grey
  const [backgroundColor, setBackgroundColor] = useState("#f9f9f9");

  // State to manage transparency percentage; default is 70%
  const [transparency, setTransparency] = useState(70);

  // Example list of Google Fonts for the font selection dropdown
  const googleFonts = [
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Source Sans Pro",
    "Slabo 27px",
    "Oswald",
    "Raleway",
    "Merriweather",
    "Ubuntu",
  ];

  /**
   * useEffect hook to initialize the dialog and load saved settings from Tableau.
   * Runs only once when the component mounts.
   */
  useEffect(() => {
    const tableau = window.tableau; // Access the Tableau Extensions API

    // Initialize the Tableau dialog
    tableau.extensions.initializeDialogAsync().then(() => {
      const settings = tableau.extensions.settings.getAll(); // Retrieve all saved settings

      // Parse the number of tour items (rows) from settings
      const rowCount = parseInt(settings.rowCount || "0", 10);

      // Populate the rows state based on saved settings
      const loadedRows = [];
      for (let i = 0; i < rowCount; i++) {
        loadedRows.push({
          id: i, // Unique identifier for each row
          object: settings[`tour${i}_object`] || "", // Selected dashboard object
          text: settings[`tour${i}_text`] || "", // Text for the tour item
          position: settings[`tour${i}_position`] || "right", // Position of the text box relative to the object
        });
      }
      setRows(loadedRows); // Update the rows state

      // Set selected font from settings or default to "Roboto"
      setSelectedFont(settings.selectedFont || "Roboto");

      // Set background color from settings or default to light grey
      setBackgroundColor(settings.backgroundColor || "#f9f9f9");

      // Set transparency from settings or default to 70%
      setTransparency(
        settings.transparency !== undefined
          ? parseInt(settings.transparency, 10)
          : 70
      );

      // Access the Tableau dashboard to fetch available objects
      const dashboard = tableau.extensions.dashboardContent.dashboard;

      // Collect all objects (worksheets, zones, etc.) present in the dashboard
      const dashboardItems = dashboard.objects.map((obj) => ({
        id: obj.id, // Unique identifier for the dashboard object
        name: obj.name || `Object ${obj.id}`, // Name of the object or a fallback name
        type: obj.type, // Type of the dashboard object (e.g., worksheet, dashboard)
      }));

      setDashboardObjects(dashboardItems); // Update the dashboardObjects state with available objects
    });
  }, []); // Empty dependency array ensures this runs only once on mount

  /**
   * Handler to add a new row (tour item) to the list.
   */
  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      { id: prev.length, object: "", text: "", position: "right" }, // New row with default values
    ]);
  };

  /**
   * Handler to delete a specific row (tour item) by its ID.
   * @param {number} id - The unique identifier of the row to be deleted.
   */
  const handleDeleteRow = (id) => {
    setRows((prev) => prev.filter((row) => row.id !== id)); // Remove the row with the matching ID
  };

  /**
   * Handler to move a row (tour item) up in the list.
   * @param {number} index - The current index of the row to be moved.
   */
  const handleMoveUp = (index) => {
    if (index === 0) return; // Do nothing if the row is already at the top
    const newRows = [...rows]; // Create a shallow copy of the rows
    // Swap the current row with the one above it
    [newRows[index - 1], newRows[index]] = [newRows[index], newRows[index - 1]];
    setRows(newRows); // Update the rows state with the new order
  };

  /**
   * Handler to move a row (tour item) down in the list.
   * @param {number} index - The current index of the row to be moved.
   */
  const handleMoveDown = (index) => {
    if (index === rows.length - 1) return; // Do nothing if the row is already at the bottom
    const newRows = [...rows]; // Create a shallow copy of the rows
    // Swap the current row with the one below it
    [newRows[index], newRows[index + 1]] = [newRows[index + 1], newRows[index]];
    setRows(newRows); // Update the rows state with the new order
  };

  /**
   * Handler to save the current configuration settings to Tableau.
   * It saves font, background color, transparency, and all tour items.
   */
  const handleSave = () => {
    const tableau = window.tableau; // Access the Tableau Extensions API

    // Retrieve all existing settings
    const existingSettings = tableau.extensions.settings.getAll();

    // Remove all existing settings to prepare for new ones
    Object.keys(existingSettings).forEach((key) => {
      tableau.extensions.settings.erase(key);
    });

    // Save the selected font, background color, and transparency
    tableau.extensions.settings.set("selectedFont", selectedFont);
    tableau.extensions.settings.set("backgroundColor", backgroundColor);
    tableau.extensions.settings.set("transparency", transparency.toString());

    // Save the number of tour items (rows)
    tableau.extensions.settings.set("rowCount", rows.length.toString());

    // Save each tour item's object, text, and position
    rows.forEach((row, index) => {
      tableau.extensions.settings.set(`tour${index}_object`, row.object);
      tableau.extensions.settings.set(`tour${index}_text`, row.text);
      tableau.extensions.settings.set(`tour${index}_position`, row.position);
    });

    // Persist the settings asynchronously and close the dialog upon success
    tableau.extensions.settings.saveAsync().then(() => {
      tableau.extensions.ui.closeDialog("Settings saved successfully");
    });
  };

  /**
   * Handler to cancel the configuration and close the dialog without saving.
   */
  const handleCancel = () => {
    const tableau = window.tableau; // Access the Tableau Extensions API
    tableau.extensions.ui.closeDialog("Cancelled"); // Close the dialog with a cancellation message
  };

  /**
   * Handler to switch between tabs.
   * @param {object} event - The event object.
   * @param {number} newValue - The index of the newly selected tab.
   */
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue); // Update the active tab value
  };

  /**
   * Handler to manage changes in the transparency input field.
   * Ensures that only valid numbers between 0 and 100 are accepted.
   * @param {object} e - The event object from the input field.
   */
  const handleTransparencyChange = (e) => {
    const value = e.target.value;
    // Allow the field to be empty
    if (value === "") {
      setTransparency("");
      return;
    }
    const numericValue = parseInt(value, 10); // Parse the input as an integer
    // Check if the parsed value is a number and within the valid range
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 100) {
      setTransparency(numericValue); // Update the transparency state
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Tabs for navigating between 'General' and 'Tour Items' */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="General" /> {/* Tab for General settings */}
          <Tab label="Tour Items" /> {/* Tab for managing Tour Items */}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        {/* General Tab Content */}
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Select Text Font
        </Typography>
        <Select
          value={selectedFont}
          onChange={(e) => setSelectedFont(e.target.value)}
          fullWidth
          sx={{
            height: "40px", // Set a consistent height for the dropdown
            mb: 1, // Margin bottom for spacing
          }}
        >
          <MenuItem value="" disabled>
            Select Font {/* Placeholder option */}
          </MenuItem>
          {googleFonts.map((font) => (
            <MenuItem key={font} value={font}>
              {font} {/* Render each font as a selectable option */}
            </MenuItem>
          ))}
        </Select>

        {/* Typography for Background Color Selection */}
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Select Background Color
        </Typography>

        {/* Container Box for Color Picker and Transparency Settings */}
        <Box sx={{ mb: 4, display: "flex", gap: 2 }}>
          {/* Container for Color Picker and Transparency Section */}
          <Box
            sx={{
              display: "flex", // Enable flexbox
              flexDirection: "row", // Arrange children horizontally
              alignItems: "flex-start", // Align children to the top of the container
              justifyContent: "flex-start", // Align children to the start of the main axis
              gap: 2, // Space between color picker and transparency section
            }}
          >
            {/* Color Picker Section */}
            <Box>
              <ChromePicker
                color={backgroundColor} // Current selected color
                onChangeComplete={(color) => setBackgroundColor(color.hex)} // Update color state on change
                disableAlpha // Disable the alpha (transparency) slider as it's handled separately
              />
            </Box>

            {/* Transparency Input and Preview Section */}
            <Box
              sx={{
                display: "flex", // Enable flexbox
                flexDirection: "column", // Arrange children vertically
                alignItems: "flex-start", // Align children to the start of the cross axis (left)
                justifyContent: "flex-start", // Align children to the start of the main axis (top)
                gap: 2, // Space between transparency input and preview box
              }}
            >
              {/* Transparency Input Field */}
              <TextField
                label="Transparency (%)" // Label for the input
                type="number" // Input type as number
                value={transparency} // Current transparency value
                onChange={handleTransparencyChange} // Handler for input changes
                InputProps={{
                  inputProps: { min: 0, max: 100 }, // Restrict input values between 0 and 100
                }}
                sx={{ width: "150px" }} // Set a fixed width for the input field
                helperText="Enter a value between 0 and 100" // Helper text for guidance
              />

              {/* Preview Box to Show Selected Color and Transparency */}
              <Box
                sx={{
                  width: "100px", // Fixed width for the preview box
                  height: "40px", // Fixed height for the preview box
                  backgroundColor: backgroundColor, // Background color based on selection
                  opacity: transparency / 100, // Apply transparency based on the input value
                  border: "1px solid #ccc", // Light border for definition
                  borderRadius: "4px", // Rounded corners
                  display: "flex", // Enable flexbox to center content
                  alignItems: "center", // Vertically center the text
                  justifyContent: "center", // Horizontally center the text
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: "center", // Center the text
                    color: "#FFFFFF", // White text for contrast
                    fontSize: "12px", // Smaller font size for the preview
                  }}
                >
                  Preview {/* Text displayed inside the preview box */}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </TabPanel>

      {/* Tour Items Tab Content */}
      <TabPanel value={tabValue} index={1}>
        {rows.map((row, index) => (
          <Box
            key={row.id} // Unique key for each row
            sx={{
              display: "flex", // Enable flexbox for the row
              alignItems: "center", // Vertically center items within the row
              mb: 2, // Margin bottom for spacing between rows
              p: 0, // No padding
              height: "40px", // Fixed height for consistency
              borderRadius: "4px", // Rounded corners
            }}
          >
            {/* Dropdown to Select Dashboard Object */}
            <Select
              value={row.object}
              onChange={(e) =>
                setRows((prev) =>
                  prev.map((r) =>
                    r.id === row.id ? { ...r, object: e.target.value } : r
                  )
                )
              }
              sx={{ mr: 2, height: "100%", width: "150px" }} // Set width and height to fill the row
              displayEmpty // Display placeholder when no option is selected
            >
              <MenuItem value="" disabled>
                Select Object {/* Placeholder option */}
              </MenuItem>
              {dashboardObjects.map((object) => (
                <MenuItem key={object.id} value={object.id}>
                  {object.name} ({object.type}){" "}
                  {/* Display object name and type */}
                </MenuItem>
              ))}
            </Select>

            {/* Text Field to Enter Tour Item Text */}
            <TextField
              label="Text" // Label for the text input
              value={row.text} // Current text value
              onChange={(e) =>
                setRows((prev) =>
                  prev.map((r) =>
                    r.id === row.id ? { ...r, text: e.target.value } : r
                  )
                )
              }
              variant="outlined" // Outlined variant for better visibility
              sx={{
                flex: 2, // Allow the text field to grow and take up available space
                mr: 2, // Margin right for spacing
                height: "100%", // Fill the row's height
                "& .MuiOutlinedInput-root": {
                  height: "100%", // Ensure the input fills the height
                  display: "flex", // Enable flexbox for the input
                  alignItems: "center", // Vertically center the text within the input
                },
              }}
            />

            {/* Dropdown to Select Position of the Preview Text */}
            <Select
              value={row.position}
              onChange={(e) =>
                setRows((prev) =>
                  prev.map((r) =>
                    r.id === row.id ? { ...r, position: e.target.value } : r
                  )
                )
              }
              sx={{ mr: 2, height: "100%", width: "100px" }} // Set width and height to fill the row
              displayEmpty // Display placeholder when no option is selected
            >
              <MenuItem value="left">Left</MenuItem>
              <MenuItem value="right">Right</MenuItem>
              <MenuItem value="top">Top</MenuItem>
              <MenuItem value="bottom">Bottom</MenuItem>
            </Select>

            {/* Action Buttons: Move Up, Move Down, Delete */}
            <Box>
              {/* Move Up Button */}
              <IconButton
                color="primary"
                onClick={() => handleMoveUp(index)} // Handler to move the row up
                disabled={index === 0} // Disable if the row is already at the top
              >
                <ArrowUpwardIcon /> {/* Upward arrow icon */}
              </IconButton>

              {/* Move Down Button */}
              <IconButton
                color="primary"
                onClick={() => handleMoveDown(index)} // Handler to move the row down
                disabled={index === rows.length - 1} // Disable if the row is already at the bottom
              >
                <ArrowDownwardIcon /> {/* Downward arrow icon */}
              </IconButton>

              {/* Delete Button */}
              <IconButton
                color="error"
                onClick={() => handleDeleteRow(row.id)} // Handler to delete the row
              >
                <DeleteIcon /> {/* Delete (trash can) icon */}
              </IconButton>
            </Box>
          </Box>
        ))}

        {/* Button to Add a New Tour Item Row */}
        <Box sx={{ m: 1 }}>
          <Button
            variant="outlined" // Outlined variant for visibility
            color="primary"
            startIcon={<AddIcon />} // Add icon before the button text
            onClick={handleAddRow} // Handler to add a new row
            sx={{ mr: 1 }} // Margin right for spacing
          >
            Add Row {/* Button text */}
          </Button>
        </Box>
      </TabPanel>

      {/* Sticky Footer with Cancel and Save Buttons */}
      <Box
        sx={{
          p: 2, // Padding for the footer
          borderTop: "1px solid #ddd", // Top border for separation
          display: "flex", // Enable flexbox
          justifyContent: "flex-end", // Align buttons to the end (right side)
          gap: 1, // Space between buttons
          backgroundColor: "#fff", // White background for the footer
        }}
      >
        <Button
          variant="text" // Text variant for a subtle appearance
          color="primary"
          onClick={handleCancel} // Handler to cancel and close the dialog
        >
          Cancel {/* Button text */}
        </Button>
        <Button
          variant="contained" // Contained variant for prominence
          color="primary"
          onClick={handleSave} // Handler to save settings
        >
          Save {/* Button text */}
        </Button>
      </Box>
    </Box>
  );
};

export default Configure; // Export the Configure component as default
