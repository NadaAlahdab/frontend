import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaLock, FaLockOpen, FaHeart, FaRegHeart } from "react-icons/fa";

const GenerateColor = () => {
  const [colors, setColors] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState({});
  const [formattedColors, setFormattedColors] = useState([]);
  const [paletteName, setPaletteName] = useState("");
  const [palettes, setPalettes] = useState([]);
  const [paletteNames, setPaletteNames] = useState([]);
  const [likedPalettes, setLikedPalettes] = useState(false);

  useEffect(() => {
    fetchColors();
    fetchPalettes();
    fetchPaletteNames();
    fetchLikedPalettes();
  }, []);

  const fetchColors = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/colors");
      setColors(response.data);
      setFormattedColors(response.data.map(color => color.color));
    } catch (error) {
      console.error("Error fetching colors:", error);
    }
  };

  const fetchPalettes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/get-palettes");
      setPalettes(response.data);
    } catch (error) {
      console.error("Error fetching palettes:", error);
    }
  };
  const fetchPaletteNames = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/palette-names");
      setPaletteNames(response.data);
    } catch (error) {
      console.error("Error fetching palette names:", error);
    }
  };

  const fetchPaletteColors = async (paletteName) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/palette/${paletteName}`);
      setColors(response.data.map((color) => ({ color, locked: false }))); // تعيين الألوان
      setFormattedColors(response.data);
    } catch (error) {
      console.error("Error fetching palette colors:", error);
    }
  };
  const fetchLikedPalettes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/liked-palettes");
      setLikedPalettes(response.data);
    } catch (error) {
      console.error("Error fetching liked palettes:", error);
    }
  }

  const savePalette = async () => {
    if (!paletteName) {
      alert("Please enter a name for the palette.");
      return;
    }
    const palette = {
      paletteName,
      colors: formattedColors,
    };
    try {
      const response = await axios.post("http://localhost:5000/api/save-palette", palette);
      if (response.status === 200) {
        alert("Palette saved successfully!");
        setPaletteName("");
        fetchPalettes();
      } else {
        alert("Failed to save palette.");
      }
    } catch (error) {
      console.error("Error saving palette:", error);
      alert("Error saving palette. Please check the console for details.");
    }
  };


  const updateColors = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/colors/update");
      setColors(response.data);
    } catch (error) {
      console.error("Error updating colors:", error);
    }
  };

  const handleFormatChange = async (index, format) => {
    const colorHex = colors[index].color;
    try {
      const response = await axios.get("http://localhost:5000/api/convert-color", {
        params: { color: colorHex, format: format },
      });
      const convertedColor = response.data.color;
      setFormattedColors((prevColors) => {
        const updatedColors = [...prevColors];
        if (format === "rgb") {
          const { r, g, b } = response.data.color;
          updatedColors[index] = `rgb(${r}, ${g}, ${b})`;
        } else {
          updatedColors[index] = convertedColor;
        }
        return updatedColors;
      });

      setSelectedFormats((prevFormats) => ({ ...prevFormats, [index]: format }));
    } catch (error) {
      console.error("Error converting color format:", error);
    }
  };

  const toggleLock = async (index) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/colors/toggle-lock/${index}`);
      setColors(response.data);
    } catch (error) {
      console.error("Error toggling lock:", error);
    }
  };

  const generateMonochromeColors = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/random-color");
      const randomColor = response.data.color;

      const monochromeResponse = await axios.get("http://localhost:5000/api/monochrome", {
        params: { baseColor: randomColor },
      });
      const newColors = monochromeResponse.data.map(color => ({
        color,
        locked: false,
      }));
      setColors(newColors);
      setFormattedColors(newColors.map(color => color.color));
    } catch (error) {
      console.error("Error generating monochrome colors:", error);
    }
  };

  const generateTriadicColors = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/random-color");
      const randomColor = response.data.color;

      const triadicResponse = await axios.get("http://localhost:5000/api/triadic", {
        params: { baseColor: randomColor },
      });
      const newColors = triadicResponse.data.map((color) => ({
        color,
        locked: false,
      }));
      setColors(newColors);
      setFormattedColors(newColors.map(color => color.color));
    } catch (error) {
      console.error("Error generating triadic colors:", error);
    }
  };

  const generateTetradicColors = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/random-color");
      const randomColor = response.data.color;
      const tetradicResponse = await axios.get("http://localhost:5000/api/tetradic", {
        params: { baseColor: randomColor },
      });
      const newColors = tetradicResponse.data.map((color) => ({
        color,
        locked: false,
      }));
      setColors(newColors);
      setFormattedColors(newColors.map(color => color.color));
    } catch (error) {
      console.error("Error generating tetradic colors:", error);
    }
  };

  const toggleLike = async (paletteName) => {
    try {
      const response = await axios.post("http://localhost:5000/api/toggle-like", { paletteName });
      setLikedPalettes(prev => ({
        ...prev,
        [paletteName]: response.data.liked
      }));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleDownloadPalette = async (paletteName) => {
    try {
      const response = await fetch(`http://localhost:5000/api/download-palette/${paletteName}`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error("Failed to download palette.");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${paletteName}-palette.css`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading palette:", error);
    }
  };

  
  return (
    <>
      <button
        onClick={updateColors}
        className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
      >
        Generate Random Color
      </button>
      <button
        onClick={generateMonochromeColors}
        className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition duration-300 ml-4"
      >
        Generate Monochrome Colors
      </button>
      <button
        onClick={generateTriadicColors}
        className="bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-700 transition duration-300 ml-4"
      >
        Generate Triadic Colors
      </button>
      <button
        onClick={generateTetradicColors}
        className="bg-purple-500 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 transition duration-300 ml-4"
      >
        Generate Tetradic Colors
      </button>
      <div className="flex flex-col items-center mb-4">
        <input
          type="text"
          value={paletteName}
          onChange={(e) => setPaletteName(e.target.value)}
          placeholder="Enter palette name"
          className="border p-2 rounded mb-2"
        />
        <button
          onClick={savePalette}
          className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition duration-300"
        >
          Save Palette
        </button>
        <button
          onClick={() => handleDownloadPalette(paletteName)}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
        >
          Download CSS Palette
        </button>

        <div className="flex justify-center mt-4">
          <button onClick={toggleLike}>
            {likedPalettes[paletteName] ? (
              <FaHeart className="text-red-500 text-3xl transition-all duration-300 hover:scale-125" />
            ) : (
              <FaRegHeart className="text-gray-500 text-3xl transition-all duration-300 hover:scale-125" />
            )}
          </button>
        </div>

        <div className="flex flex-col items-center mb-4">
          <h3 className="text-xl font-bold mb-2">Saved Palettes</h3>
          <select
            className="p-2 border rounded text-gray-700"
            onChange={(e) => fetchPaletteColors(e.target.value)}
            defaultValue=""
          >
            <option >
              Select a Palette
            </option>
            {paletteNames.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-5 h-screen">

        {colors.map((colorObj, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center cursor-pointer p-4"
            style={{ backgroundColor: colorObj.color }}
            onClick={() => toggleLock(index)}
          >
            <div className="flex items-center mb-2">
              <div className="text-4xl text-white font-bold">
                {colorObj.locked ? <FaLock /> : <FaLockOpen />}
              </div>

            </div>
            <div className="text-lg text-white mb-2">
              {formattedColors[index] || colorObj.color}
            </div>
            <select
              value={selectedFormats[index] || "hex"}
              onChange={(e) => handleFormatChange(index, e.target.value)}
              className="mt-2 p-1 bg-transparent"
            >
              <option value="hex">HEX</option>
              <option value="rgb">RGB</option>
              <option value="hsl">HSL</option>
            </select>
          </div>
        ))}
      </div>
    </>
  );
};

export default GenerateColor;
