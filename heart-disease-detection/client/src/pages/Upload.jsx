import React, { useState } from 'react';

const UploadForm = () => {
  const [imageFile, setImageFile] = useState(null);
  const [jsonFile, setJsonFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile || !jsonFile) {
      setError("Please select both an image and a JSON file.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("json", jsonFile);

    try {
      console.log("Sending request to backend...");
      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response:", data);
      setResult(data);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex justify-center items-center p-6 bg-gradient-to-r from-pink-50 to-purple-50">
      <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-3xl font-semibold text-center mb-6 text-pink-700">
          Upload Files for Prediction
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-pink-600">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              required
              className="w-full p-3 border border-pink-300 rounded-md bg-pink-50 text-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-pink-600">
              Upload JSON File
            </label>
            <input
              type="file"
              accept=".json"
              onChange={(e) => setJsonFile(e.target.files[0])}
              required
              className="w-full p-3 border border-pink-300 rounded-md bg-pink-50 text-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md bg-pink-500 text-white font-semibold ${
              loading ? "opacity-50" : "hover:bg-pink-600"
            } transition-all shadow-md`}
          >
            {loading ? "Processing..." : "Upload"}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            <p>{error}</p>
          </div>
        )}
        
        {result && result.predictions && (
          <div className="mt-6">
            <h3 className="font-semibold text-pink-700 mb-2">Prediction Results:</h3>
            <div className="bg-gray-50 rounded-md border border-pink-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-pink-100">
                  <tr>
                    <th className="py-2 px-4 font-semibold text-pink-800">Class</th>
                    <th className="py-2 px-4 font-semibold text-pink-800">Probability (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.predictions.map((prediction, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-pink-50"}>
                      <td className="py-3 px-4 border-t border-pink-100 font-medium text-pink-700">{prediction.class}</td>
                      <td className="py-3 px-4 border-t border-pink-100 text-pink-700">{prediction.probability.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadForm;