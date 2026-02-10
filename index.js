const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const fibonacci = (n) =>{
    if(n<=0) return[];
    let series = [0,1];
    for(let i=2; i<n; i++){
        series.push(series[i-1] + series[i-2]);
    }
    return series.slice(0, n);
};

const isPrime = (num) => {
    if(num < 2) return false;
    for(let i=2; i<=Math.sqrt(num); i++){
        if(num%i === 0) return false;
    }
    return true;
};

const hcf = (a,b) =>{
    while(b!==0){
        [a,b] = [b, a%b];
    }
    return a;
};
const hcfArray = (arr) =>
    arr.reduce(hcf);

const lcm = (a,b) =>(a*b) /hcf(a,b);
const lcmArray = (arr) =>
    arr.reduce(lcm);

const askAI = async (question) => {
  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        contents: [
          {
            parts: [{ text: question }]
          }
        ]
      },
      {
        params: {
          key: process.env.GEMINI_API_KEY
        }
      }
    );

    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Empty AI response");
    }

    return text
      .replace(/[^a-zA-Z]/g, " ")
      .trim()
      .split(/\s+/)[0];

  } catch (err) {
    console.error("Gemini Error:", err.response?.data || err.message);
    throw err;
  }
};



app.get("/health", (req, res) =>{
    res.status(200).json({
        is_success: true,
        official_email: process.env.OFFICIAL_EMAIL
    });
});

app.post("/bfhl", async (req, res) =>{
    try{
        const body = req.body;
        const keys = Object.keys(body);

        if(keys.length !== 1){
            return res.status(400).json({
                is_success: false,
                official_email: process.env.OFFICIAL_EMAIL,
                error: "Exactly one key is required"
            });
        }

        let data;
        const key = keys[0];

        switch(key){
            case "fibonacci":
                data = fibonacci(body.fibonacci);
                break;

            case "prime":
                data = body.prime.filter(isPrime);
                break;

            case "lcm":
                data = lcmArray(body.lcm);
                break;

            case "hcf":
                data = hcfArray(body.hcf);
                break;

            case "AI":
                data = await askAI(body.AI);
                break;

            default:
                return res.status(400).json({
                    is_success: false,
                    official_email: process.env.OFFICIAL_EMAIL,
                    error: "Invalid key"
                });
        }

        res.status(200).json({
            is_success: true,
            official_email: process.env.OFFICIAL_EMAIL, data
        });
    }

    catch(error){
        res.status(500).json({
            is_success: false,
            official_email: process.env.OFFICIAL_EMAIL,
            error: "Internal server error"
        });
    }
});

app.listen(PORT, () =>{
    console.log(`Server running on PORT${PORT}`);
});