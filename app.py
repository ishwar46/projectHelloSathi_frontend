from openai import OpenAI

# Use OpenAI API Key
client = OpenAI(
    api_key="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"
)

# Ask the user for question
question = input("What would you Like to ask ChatGPT? ")
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "user", "content": f"{question}"},
    ],
    max_tokens=512,
    n=1,
    stop=None,
    temperature=0.8,
)
print(response)
answer = response.choices[0].message.content
print("OpenAI:" + answer)