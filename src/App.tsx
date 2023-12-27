import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import './index.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faTimesCircle } from "@fortawesome/free-solid-svg-icons";


import env from "react-dotenv";

// init


// const API_KEY = process.env.GOOGLE_API_KEY 
const GOOGLE_API_KEY = env.GOOGLE_API_KEY

interface GenerativePart {
  inlineData: { data: string; mimeType: string };
}

const App: React.FC = () => {
  
  const genai = new GoogleGenerativeAI(GOOGLE_API_KEY ?? '');
  const [compareSearch, setCompareSearch] = useState<string>('');
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [timeTaken, setTimeTaken] = useState<number | null>(null);

  const fileToGenerativePart = async (file: File): Promise<GenerativePart> => {
    try {
      const base64EncodeDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      const data = await base64EncodeDataPromise;
      if (!data) {
        throw new Error('Failed to read file or extract base64 data.');
      }
      return { inlineData: { data, mimeType: file.type } };

    } catch (error) {
      console.error('Error processing file: ', error);
      throw new Error('Error processing file');
    }
  }

  const getTable = async () => {
    setIsLoading(true);
    const time1 = performance.now();

    try {
      if (images && images.length >= 2) {
        const model = genai.getGenerativeModel({ model: "gemini-pro-vision" });
        const prompt = 'Generate a comparison table from content of both images provided. Comparison can include everything about the objects in images for example:characteristics, topic, nature, country etc.'
        const fileInputEl = document.querySelector<HTMLInputElement>("input[type=file]")
        if (!fileInputEl) {
          console.error("file input element not found");
          return;
        }

        const imageParts = await Promise.all(
          images.map(fileToGenerativePart)
        );

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = await response.text();
        console.log("Result : ",text)
        const values = text
          .split('\n')
          .map(line => line.split('|')
            .filter(Boolean)
            .map(item => item.trim()));

        setTableData(values);

      }
      else {
        const model = genai.getGenerativeModel({ model: "gemini-pro" });
        const prompt = updatePrompt();
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Result : ", text)

        //parse the text to extract relevant information
        const values = text
          .split('\n')
          .map(line => line.split('|')
            .filter(Boolean)
            .map(item => item.trim()));

        setTableData(values);

      }
    } catch (error) {
      console.error("Error generating comparison : ", error);
    } finally {
      const time2 = performance.now();
      const taken = (time2 - time1) / 1000;
      setTimeTaken(taken);
      setIsLoading(false)
    }
  }

  const updatePrompt = () => {
    // console.log('prompt : ', compareSearch);

    const prompt = `generate a comparison table of ${compareSearch}.
          Use highly cohrent precise points to compare and make sure you bring up the rare facts as well for every comparison.`;
    // console.log(prompt);
    return prompt
  }


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    getTable();
    setImages([]);
    setImagePreviews([]);
    //setCompareSearch('');
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = (e.target as HTMLInputElement).files;
    if (files) {
      const imageUrls = Array.from(files);
      setImages([...images, ...imageUrls]);

      const previews = imageUrls.map((file) => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...previews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images];
    const updatedPreviews = [...imagePreviews];

    updatedImages.splice(index, 1)
    updatedPreviews.splice(index, 1);

    setImages(updatedImages);
    setImagePreviews(updatedPreviews);
  }


  return (
    <div className="App">
      <header className="App-header">
        <h1>CompareAI</h1>
        <p><a href="https://github.com/xadhrit">Github</a></p>
      </header>

      <main className="App-main">
        <form className="flex flex-wrap items-center" style={{ maxWidth: '80%', margin: '0 auto' }} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Hydrogen vs. Nitrogen"
            value={compareSearch}
            onChange={(e) => setCompareSearch(e.target.value)}
            className="flex-grow border-2 p-2 rounded-md"
            style={{ maxWidth: '70%', marginTop: '4vh', border: 'none' }}

          />
          {imagePreviews.length > 0 && (
            <div className="imagePreviewContainer">
              {imagePreviews.map((preview, index) =>
              (
                <div key={index} className="imagePreviewItem">
                  <img
                    key={index}
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="imagePreview"
                  />
                  <FontAwesomeIcon icon={faTimesCircle} className="removeIcon" onClick={() => handleRemoveImage(index)}

                  />
                </div>
              ))}
            </div>
          )}
          <label htmlFor="image-upload" className="fileUploadLabel mr-2">
            <FontAwesomeIcon icon={faImage} style={{ cursor: "pointer", marginLeft: "10px", height: "2rem" }}
            />
          </label>
          <input id="image-upload" type="file" accept="image/*" onChange={handleUpload} multiple className="fileUploadInput" />

          <button type="submit" className="flex item-center justify-center bg-black text-white p-2 rounded-md mx-auto w-32" style={{ marginTop: '4vh' }}>
            Generate 🪄
          </button>
        </form>
        {isLoading ? (
          <div className="loading-animation">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <div className="py-6 px-4 ml-5 mr-5 mt-4 border loading-row"></div>


                {/* Repeat for each column */}
              </div>
            ))}
          </div>
        ) : (

          tableData.length > 0 && (
            <div className="table-container">
              <table className="w-4.5 border border-grey-50 ml-5 mr-5 mt-9 mb-4">
                <thead>
                  <tr className="bg-yellow-200">
                    <th className="py-2 px-4 border">Property</th>
                    {tableData[0].slice(1).map((header, index) => (
                      <th key={index} className="py-2 px-4 border">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex} className={(rowIndex % 2 === 0) ? 'bg-gray-100' : 'bg-white'}>
                      <td className="py-2 px-4 border">{row[0]}</td>
                      {row.slice(1).map((value, index) => (
                        <td key={index} className="py-2 px-4 border">{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>

              </table>
              {timeTaken && <p className="timeTaken">Table generated in {timeTaken.toFixed(2)} seconds</p>}
            </div>
          ))}
      </main>
      <footer style={{ position: 'relative', marginTop: '10vh', bottom: 0, width: '100%', textAlign: 'center' }}>
        DISTRIBUTED UNDER MIT LICENSE by Adhrit | <a href="https://twitter.com/xadhrit">@xadhrit</a>
      </footer>
    </div>
  )
}

export default App;