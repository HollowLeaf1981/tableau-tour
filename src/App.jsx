// Import necessary React hooks and Material-UI components
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles"; // Utility to apply alpha transparency to colors
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew"; // Back arrow icon
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"; // Forward arrow icon
import "./index.css"; // Import custom CSS for additional styling

/**
 * App component serves as the main component for the Tableau Tour extension.
 * It manages tour items, navigation between steps, and displays tooltips
 * with customizable fonts, background colors, and transparency.
 */
const App = () => {
  // State to manage the list of tour items (each step in the tour)
  const [tourItems, setTourItems] = useState([]);

  // State to track the current tour step index
  const [currentStep, setCurrentStep] = useState(0);

  // State to store positions of grey overlay boxes around the Tableau extension
  const [boxPositions, setBoxPositions] = useState({});

  // State to store the dimensions and position of the Tableau extension object
  const [extensionPosition, setExtensionPosition] = useState(null);

  // State to store the position and size of the text box for the current tour step
  const [textPosition, setTextPosition] = useState(null);

  // State to control the visibility of the text box
  const [textVisible, setTextVisible] = useState(false);

  // State to manage the selected font for the tour text; default is "Roboto"
  const [selectedFont, setSelectedFont] = useState("Roboto");

  // State to manage the selected background color for the overlay boxes; default is black
  const [backgroundColor, setBackgroundColor] = useState("#000000");

  // State to manage the transparency level of the overlay boxes; default is 70%
  const [backgroundTransparency, setBackgroundTransparency] = useState(70);

  /**
   * useEffect hook to initialize the Tableau Extensions API when the component mounts.
   * It sets up the extension, fetches initial tour items, and retrieves the position
   * and size of the Tableau extension object.
   */
  useEffect(() => {
    // Define an asynchronous function to initialize Tableau Extensions API
    const initializeTableau = async () => {
      try {
        // Check if Tableau Extensions API is available in the global window object
        if (!window.tableau) {
          throw new Error("Tableau Extensions API is not available.");
        }

        const tableau = window.tableau; // Access the Tableau Extensions API

        // Initialize the Tableau dialog; 'configure' is the callback for configuration
        await tableau.extensions.initializeAsync({
          configure: configure, // Function to open the configuration dialog
        });

        console.log("Tableau Extensions API Initialized");

        // Access the Tableau dashboard content
        const dashboard = tableau.extensions.dashboardContent.dashboard;

        // Search for the Tableau Tour object in the dashboard by name
        const extensionObject = dashboard.objects.find(
          (obj) => obj.name === "Tableau Tour"
        );

        if (extensionObject) {
          // If the Tableau Tour object is found, store its position and size
          setExtensionPosition({
            x: extensionObject.position.x, // X-coordinate relative to the dashboard
            y: extensionObject.position.y, // Y-coordinate relative to the dashboard
            width: extensionObject.size.width, // Width of the Tableau extension
            height: extensionObject.size.height, // Height of the Tableau extension
          });
        }

        // Fetch and set the tour items based on saved settings
        refreshTourItems();
      } catch (error) {
        // Log any errors encountered during initialization
        console.error("Error initializing Tableau Extensions API:", error);
      }
    };

    // Call the initializeTableau function to start the initialization process
    initializeTableau();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount

  /**
   * useEffect hook to update the positions of the grey overlay boxes whenever
   * the list of tour items or the extension's position changes.
   */
  useEffect(() => {
    // Ensure that there are tour items and the extension's position is known
    if (tourItems.length > 0 && extensionPosition) {
      // Update box positions for the first tour item
      updateBoxPositions(0, tourItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourItems, extensionPosition]); // Trigger when either tourItems or extensionPosition changes

  /**
   * Function to open the configuration dialog.
   * It navigates to the '/configure' route, allowing users to set up tour settings.
   */
  const configure = () => {
    // Define the URL for the configuration popup
    const popupUrl = `${window.location.origin}/configure`;

    // Display the configuration dialog with specified dimensions
    window.tableau.extensions.ui
      .displayDialogAsync(popupUrl, "5", { height: 550, width: 700 })
      .then(() => {
        console.log("Configuration dialog closed.");

        // Refresh the tour items after the dialog is closed, in case settings have changed
        refreshTourItems();
      })
      .catch((error) => {
        // Handle errors that occur while displaying the dialog
        if (error.errorCode === window.tableau.ErrorCodes.DialogClosedByUser) {
          console.log("Dialog was closed by the user.");
        } else {
          console.error("Error displaying dialog:", error);
        }
      });
  };

  /**
   * Function to refresh and load tour items based on saved settings.
   * It retrieves settings from Tableau, constructs tour items, and updates state.
   */
  const refreshTourItems = () => {
    const tableau = window.tableau; // Access the Tableau Extensions API
    const dashboard = tableau.extensions.dashboardContent.dashboard; // Access the dashboard

    // Build a map of object details for easy lookup by object ID
    const objectDetailsMap = dashboard.objects.reduce((acc, obj) => {
      acc[obj.id] = {
        name: obj.name || `Object ${obj.id}`, // Name of the object
        x: obj.position.x || 0, // X-coordinate
        y: obj.position.y || 0, // Y-coordinate
        width: obj.size.width || 0, // Width of the object
        height: obj.size.height || 0, // Height of the object
      };
      return acc;
    }, {});

    const settings = tableau.extensions.settings.getAll(); // Retrieve all saved settings

    const rowCount = parseInt(settings.rowCount || "0", 10); // Number of tour items

    // Retrieve and set the selected font from settings
    const font = settings["selectedFont"] || "Roboto";
    setSelectedFont(font);

    // Retrieve and set the background color from settings
    const bgColor = settings["backgroundColor"] || "#000000";
    setBackgroundColor(bgColor);

    // Retrieve and set the background transparency from settings
    const bgTransparency = settings["transparency"] || 70;
    setBackgroundTransparency(bgTransparency);

    // Initialize an array to hold the updated tour items
    const updatedTourItems = [];

    // Loop through each saved tour item and construct the tourItems array
    for (let i = 0; i < rowCount; i++) {
      const objectId = settings[`tour${i}_object`]; // Selected dashboard object ID
      const text = settings[`tour${i}_text`]; // Text for the tour step
      const position = settings[`tour${i}_position`] || "right"; // Position of the text box

      if (objectId && text) {
        // If both object ID and text are present, add the tour item
        updatedTourItems.push({
          objectId, // ID of the dashboard object
          text, // Text to display in the tooltip
          position, // Position of the tooltip relative to the object
          details: objectDetailsMap[objectId] || {}, // Details of the dashboard object
        });
      }
    }

    setTourItems(updatedTourItems); // Update the tourItems state
    setCurrentStep(0); // Reset to the first step after refreshing
  };

  /**
   * Function to update the positions of the grey overlay boxes and the tooltip text box
   * based on the current tour step and the associated tour item.
   * @param {number} stepIndex - The index of the current tour step.
   * @param {Array} items - The list of tour items.
   */
  const updateBoxPositions = (stepIndex, items) => {
    const item = items[stepIndex]; // Get the current tour item

    if (item?.details && extensionPosition) {
      // Ensure that the tour item has details and the extension's position is known
      const { x, y, width, height } = item.details; // Destructure object details

      // Calculate positions relative to the extension's position
      const adjustedX = x - extensionPosition.x;
      const adjustedY = y - extensionPosition.y;

      // Define additional overlap for the grey boxes
      const verticalOverlap = 0.1; // 10% overlap

      // Calculate positions for the grey overlay boxes (top, left, right, bottom)
      const positions = {
        top: {
          top: 0,
          left: 0,
          width: "100%",
          height: adjustedY, // Height from top to the object
        },
        left: {
          top: adjustedY,
          left: 0,
          width: adjustedX, // Width from left to the object
          height: height + verticalOverlap, // Height of the object plus overlap
        },
        right: {
          top: adjustedY,
          left: adjustedX + width,
          width: extensionPosition.width - (adjustedX + width), // Remaining width to the right
          height: height + verticalOverlap, // Height of the object plus overlap
        },
        bottom: {
          top: adjustedY + height,
          left: 0,
          width: "100%",
          height: extensionPosition.height - (adjustedY + height), // Remaining height below the object
        },
      };

      // Update the boxPositions state with the calculated positions
      setBoxPositions(positions);

      // Define maximum width for the text box
      const maxTextBoxWidth = 300; // Maximum width in pixels
      const textPadding = 10; // Padding between the text box and the object

      // Initialize the text box position and size
      const textBoxPosition = { width: maxTextBoxWidth, height: "auto" };

      // Determine the position of the text box based on the user's selection
      switch (item.position) {
        case "right":
          textBoxPosition.top = adjustedY;
          textBoxPosition.left = adjustedX + width + textPadding; // Position to the right of the object
          break;

        case "left":
          textBoxPosition.top = adjustedY;
          // Ensure the text box doesn't go beyond the left boundary
          textBoxPosition.left = Math.max(
            adjustedX - maxTextBoxWidth - textPadding * 3,
            0
          );
          break;

        case "top":
          textBoxPosition.top = Math.max(
            height - textPadding * 3, // Position above the object with some padding
            0
          );
          textBoxPosition.left = adjustedX;
          break;

        case "bottom":
        default:
          textBoxPosition.top = adjustedY + height + textPadding; // Position below the object with some padding
          textBoxPosition.left = adjustedX;
          break;
      }

      // Update the textPosition state with the calculated position
      setTextPosition(textBoxPosition);

      // Make the text box visible to display the current step's information
      setTextVisible(true);
    }
  };

  /**
   * Handler to navigate to the next tour step.
   * It wraps around to the first step after the last step.
   */
  const handleNext = () => {
    const nextStep = (currentStep + 1) % tourItems.length; // Calculate the next step index
    setTextVisible(false); // Hide the text box during the transition

    // Update the current step index
    setCurrentStep(nextStep);

    // Update positions based on the new step
    updateBoxPositions(nextStep, tourItems);
  };

  /**
   * Handler to navigate to the previous tour step.
   * It wraps around to the last step when navigating backward from the first step.
   */
  const handlePrevious = () => {
    const prevStep = (currentStep - 1 + tourItems.length) % tourItems.length; // Calculate the previous step index
    setTextVisible(false); // Hide the text box during the transition

    // Update the current step index
    setCurrentStep(prevStep);

    // Update positions based on the new step
    updateBoxPositions(prevStep, tourItems);
  };

  /**
   * useEffect hook to dynamically load the selected Google Font by injecting
   * a link tag into the document head whenever the selectedFont state changes.
   */
  useEffect(() => {
    if (selectedFont) {
      const linkId = "google-font-link"; // ID to identify the font link tag

      // Remove existing font link if it exists to avoid duplicates
      const existingLink = document.getElementById(linkId);
      if (existingLink) {
        existingLink.parentNode.removeChild(existingLink);
      }

      // Create a new link element for the selected font
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      // Construct the Google Fonts URL with the selected font, replacing spaces with '+'
      link.href = `https://fonts.googleapis.com/css2?family=${selectedFont.replace(
        / /g,
        "+"
      )}:wght@400;700&display=swap`;

      // Append the link element to the document head to load the font
      document.head.appendChild(link);
    }
  }, [selectedFont]); // Trigger this effect when selectedFont changes

  return (
    // Main container with relative positioning to allow absolute positioning of child elements
    <Box
      sx={{
        position: "relative", // Set relative positioning to contain absolutely positioned children
        height: extensionPosition
          ? `${extensionPosition.height}px` // Set height based on the Tableau extension's height
          : "100vh", // Fallback to full viewport height if position is not set
        width: extensionPosition
          ? `${extensionPosition.width}px` // Set width based on the Tableau extension's width
          : "100vw", // Fallback to full viewport width if position is not set
        overflow: "hidden", // Hide any overflowing content
        backgroundColor: "transparent", // Transparent background
      }}
    >
      {/* Render grey overlay boxes around the Tableau extension */}
      {Object.keys(boxPositions).map((key) => (
        <Box
          key={key} // Unique key for each box
          className={`grey-box grey-box-${key}`} // Add unique classes for potential additional styling
          sx={{
            position: "absolute", // Absolutely position the grey boxes
            backgroundColor: alpha(
              backgroundColor, // Apply the selected background color
              backgroundTransparency / 100 // Convert transparency percentage to decimal
            ),
            ...boxPositions[key], // Spread the position and size properties for the specific box
            zIndex: 1, // Set z-index to place the grey boxes behind other elements
          }}
        />
      ))}

      {/* Navigation Buttons and Tour Item Indicators */}
      <Box
        sx={{
          position: "absolute", // Absolutely position the navigation container
          top: "10px", // 10px from the top
          left: "10px", // 10px from the left
          display: "flex", // Enable flexbox layout
          gap: "10px", // Space between child elements
          alignItems: "center", // Vertically center items within the container
          zIndex: 2, // Higher z-index to appear above grey boxes
        }}
      >
        {/* Back Arrow Icon Button */}
        <ArrowBackIosNewIcon
          onClick={handlePrevious} // Navigate to the previous step on click
          sx={{
            color: "#EEEEEE", // Light grey color
            padding: "4px", // Padding around the icon
            fontSize: "20px", // Icon size
            cursor: "pointer", // Pointer cursor on hover
          }}
        />

        {/* Container for Tour Item Indicators (Circles) */}
        <Box
          sx={{
            display: "flex", // Enable flexbox layout
            gap: "5px", // Space between circles
            alignItems: "center", // Vertically center circles
          }}
        >
          {/* Render a circle for each tour item */}
          {tourItems.map((_, index) => (
            <Box
              key={index} // Unique key for each circle
              onClick={() => {
                setTextVisible(false); // Hide the text box before changing steps

                setCurrentStep(index); // Set the current step to the clicked index
                updateBoxPositions(index, tourItems); // Update positions based on the clicked step
              }}
              sx={{
                width: currentStep === index ? "30px" : "12px", // Larger circle if active
                height: "12px", // Circle height
                borderRadius: "6px", // Make the box a circle or oval
                backgroundColor: currentStep === index ? "#FFFFFF" : "#BBBBBB", // White if active, grey otherwise
                transition: "all 0.3s ease", // Smooth transition for size and color changes
                cursor: "pointer", // Pointer cursor on hover
              }}
            />
          ))}
        </Box>

        {/* Forward Arrow Icon Button */}
        <ArrowForwardIosIcon
          onClick={handleNext} // Navigate to the next step on click
          sx={{
            color: "#EEEEEE", // Light grey color
            padding: "4px", // Padding around the icon
            fontSize: "20px", // Icon size
            cursor: "pointer", // Pointer cursor on hover
          }}
        />
      </Box>

      {/* Render the tour text box for the current step */}
      {tourItems[currentStep] && textPosition && textVisible && (
        <Box
          className="tour-text-box" // Class for additional styling if needed
          sx={{
            position: "absolute", // Absolutely position the text box
            top: `${textPosition.top}px`, // Set top position based on calculation
            left: `${textPosition.left}px`, // Set left position based on calculation
            width: `${textPosition.width}px`, // Set width based on calculation
            backgroundColor: "white", // White background for readability
            padding: "10px", // Padding inside the text box
            borderRadius: "8px", // Rounded corners
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)", // Shadow for depth
            zIndex: 3, // Highest z-index to appear above all other elements
            opacity: 1, // Set opacity to fully visible
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "black", // Black text color
              whiteSpace: "normal", // Allow text to wrap
              fontFamily: selectedFont, // Apply the selected Google Font
            }}
          >
            {tourItems[currentStep].text}{" "}
            {/* Display the tour text for the current step */}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default App; // Export the App component as the default export
