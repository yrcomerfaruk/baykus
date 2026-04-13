async function query(data: { question: string }) {
  const response = await fetch(
    "https://derece.up.railway.app/api/v1/prediction/c6f7f163-d503-4922-8557-b4ac4f2e78a7",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );
  const result = await response.json();
  return result;
}

export { query };
