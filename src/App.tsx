import React, {useState} from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import './index.css';

// const API_KEY = process.env.GOOGLE_API_KEY 
const GOOGLE_API_KEY=''

const App = () => {
  
  const genai =  new GoogleGenerativeAI(GOOGLE_API_KEY ?? '');
  const [compareSearch, setCompareSearch] = useState<string>('');
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  
  const getTable = async () => {
    setIsLoading(true);
    const model  = genai.getGenerativeModel({model: "gemini-pro"});
    const prompt = updatePrompt();
    const result = await model.generateContent(prompt);
    const response =  await result.response; 
    const text = response.text();
    console.log("Result : ",text)

    //parse the text to extract relevant information
    const values = text
            .split('\n')
            .map(line => line.split('|')
            .filter(Boolean)
            .map(item => item.trim()));
    
    setTableData(values); 
    setIsLoading(false);
  }
  
  const updatePrompt = () => {
      console.log('prompt : ',compareSearch);
      const prompt = `generate a comparison table of ${compareSearch}.
      Use highly cohrent precise points to compare and make sure you bring up the rare points as well for every comparison.`;
      console.log(prompt);
      return prompt
  }


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      getTable();
      setCompareSearch('');
  }

  return (
      <div className="App">    
          <header className="App-header">
              <h1>CompareAI</h1>
            
          </header>
          
          <main className="App-main">
              <form  className="flex flex-row items-center" style={{maxWidth: '80%', margin: '0 auto'}} onSubmit={handleSubmit}>
                  <input
                    type="text"
                    placeholder="Hydrogen vs. Nitrogen"
                    value={compareSearch}
                    onChange={(e) => setCompareSearch(e.target.value)}
                    className="flex-grow border-2 p-2 rounded-md"
                    style={{maxWidth: '70%', marginTop: '4vh'}}
                  />
              
              <button type="submit" className="flex item-center justify-end bg-black text-white p-2 rounded-md ml-2 w-32" style={{marginTop: '4vh'}}>
                  Generate 🪄
              </button>
            </form>
            {isLoading ? (
               <div className="loading-animation">
               {[...Array(5)].map((_, index) => (
                 <div
                   key={index}
                   className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                 >
                   <div className="py-2 px-4 mt-4 border loading-row"></div>
                  

                   {/* Repeat for each column */}
                 </div>
               ))}
             </div>
            ): (

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
              </div>
            ))}
          </main>
          <footer style={{position: 'relative', bottom: 0, width: '100%', textAlign: 'center'}}>
              &copy; Simple Project by Adhrit | <a href="https://twitter.com/xadhrit">@xadhrit</a>
          </footer>
    </div>
  )
}

export default App;