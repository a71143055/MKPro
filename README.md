# [Mini Kaggle 프로젝트] 나만의 미니 챗봇 만들기 (2)

<aside>

어제 Q&A 챗봇을 완성하신 분들은 오늘 Google Gemini AI를 연결해서 챗봇이 데이터를 단순히 찾아 나열하는 것을 넘어, 사람처럼 자연스럽게 설명해주는 챗봇으로 한 단계 업그레이드해봅시다.

아직 어제 챗봇을 완성하지 못하신 분들도 전혀 괜찮습니다! 😄

오늘은 어제 자료를 이어서 천천히 완성해주시면 됩니다. 완성하신 후에 아래 심화 가이드를 따라오시면 되니, 부담 갖지 말고 차근차근 진행해주세요!

> 💡 완성하신 분들은 어제 만든 `df`, `search_columns`, `search_data()`, `title_column`이 그대로 있는 노트북에서 이어서 진행해주세요.
> 
> 
> (세션이 끊겼다면 Step 0~6 코드만 다시 실행하면 기존 환경을 쉽게 복원할 수 있습니다.)
> 
</aside>

## 🔀 오늘은 두 가지 심화 과정 중 하나를 선택해서 진행해보세요!

관심 있는 주제 **하나를 선택해서 진행**하시면 되고, 시간이 남는다면 다른 주제도 도전해보세요! 🚀

|  | 🧠 A. Gemini AI 연결하기 | 🎨 B. 챗봇 UX 다듬기 |
| --- | --- | --- |
| **한 줄 설명** | 챗봇이 데이터를 "찾아서 나열"하는 걸 넘어, **사람처럼 자연스러운 문장**으로 대답하게 만들기 | 챗봇의 **화면·사용성**을 다듬어서, 더 예쁘고 쓰기 편한 챗봇으로 만들기 |
| **필요한 것** | Google 계정 (Gemini API 키 발급 필요) | 어제 만든 코드만 있으면 OK (API 키 불필요) |
| **추천 대상** | AI 연동 자체가 궁금하고, "AI스러운" 자연어 답변을 만들어보고 싶은 분 | 코딩보다 **화면 디자인, 인터랙션**에 관심이 많은 분 |
| **결과물 예시** | "매운 음식 추천해줘" → 데이터 기반으로 자연스럽게 요약해서 설명하는 챗봇 | 빠른 질문 버튼, 실시간 타이핑 효과, 예쁜 테마가 적용된 채팅창 |

---

# 🧠 A. Gemini AI로 자연어 답변 챗봇 만들기

- [ ]  **`Step A-1.`** Gemini API 키 발급받기
- [ ]  **`Step A-2.`** Colab에 API 키 안전하게 저장하기
- [ ]  **`Step A-3.`** 라이브러리 설치 & 연결 테스트
- [ ]  **`Step A-4.`** 챗봇 두뇌 업그레이드 — 검색 결과를 Gemini에게 넘겨 자연어 답변 만들기
- [ ]  **`Step A-5.`** (심화) 자연어 질문을 알아서 이해하는 챗봇 만들기
- [ ]  **`Step A-6.`** 최종 챗봇 함수 완성 + 안전장치 넣기
- [ ]  **`Step A-7.`** Gradio에 연결하기
- [ ]  **`Step A-8.`** 테스트하고 다듬기

---

## Step A-1️⃣ Gemini API 키 발급받기

<aside>

⚠️ 결제 계정을 연결하지 않으면 애초에 유료로 전환될 방법이 없어요. 즉, 카드 정보를 입력하지 않는 이상 실수로 요금이 청구될 일은 없습니다. 학습용으로는 무료 제한만으로 충분하니, 오늘 가이드에서는 결제 계정 연결을 하지 않습니다.

</aside>

1. 크롬 브라우저에서 Google AI Studio 접속
2. Colab과 같은 구글 계정으로 로그인
3. 왼쪽 메뉴 또는 상단에서 **"Get API key"** 클릭
4. **"Create API key"** 클릭 (기존 Google Cloud 프로젝트가 없다면 자동으로 새로 만들어줘요)
5. 생성된 키(`AIza...`로 시작하는 긴 문자열)를 복사해두세요

<aside>

⚠️ 이 키는 비밀번호와 같아요!** 절대 카톡, 깃허브, 코드에 직접 붙여넣거나 캡처해서 공유하지 마세요. 다음 Step에서 안전하게 저장하는 방법을 알려드릴게요

</aside>

---

## Step A-2️⃣ Colab에 API 키 안전하게 저장하기

코드 안에 키를 직접 써넣으면(`api_key = "AIza..."`) 노트북을 공유하거나 캡처했을 때 키가 그대로 유출돼요. Colab의 **Secrets(보안 비밀)** 기능을 쓰면 안전합니다.

1. Colab 왼쪽 사이드바에서 **🔑 열쇠 아이콘** 클릭
2. **"새 보안 비밀 추가"** 클릭
3. 이름(Name): `GEMINI_API_KEY`
4. 값(Value): Step A-1에서 복사한 키 붙여넣기
5. **"노트북 액세스"** 토글을 켜기 (이 노트북에서 사용하겠다는 허용)

이제 코드에서는 아래처럼 안전하게 불러올 수 있어요.

```python
from google.colab import userdata

GEMINI_API_KEY = userdata.get('GEMINI_API_KEY')
print("키 불러오기 완료! (앞 5자리만 확인:", GEMINI_API_KEY[:5], ")")
```

---

## Step A-3️⃣ 라이브러리 설치 & 연결 테스트

새 코드 칸에서 Google의 공식 SDK를 설치하세요

```python
!pip install -q -U google-genai
```

설치가 끝나면 연결 테스트를 해봅니다.

```python
from google import genai

client = genai.Client(api_key=GEMINI_API_KEY)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="안녕! 너는 무슨 모델이야? 한 문장으로 대답해줘."
)

print(response.text)
```

Gemini가 답변을 출력하면 연결 성공입니다! 🎉

<aside>

💡 모델 선택 팁

- `gemini-2.5-flash`: 답변 품질이 좋고 속도도 빠른 균형잡힌 모델 (오늘 가이드 기본값)
- `gemini-2.5-flash-lite`: 더 가볍고 빠르며, 무료 사용 한도가 더 넉넉해요. 챗봇이 자주 막힌다면(할당량 초과) 이 모델로 바꿔보세요
</aside>

```python
model="gemini-2.5-flash-lite"
```

---

## Step A-4️⃣ 챗봇 두뇌 업그레이드 — 검색 결과를 Gemini에게 넘기기

어제 만든 챗봇은 조건에 맞는 **행(row)을 그대로 나열**하기만 했어요. 오늘은 이 검색 결과를 Gemini에게 "재료"로 던져주고, Gemini가 **자연스러운 문장으로 요약·설명**하게 만들어봅니다. (이런 방식을 RAG, Retrieval-Augmented Generation이라고 불러요 — "검색해서 찾은 자료를 근거로 AI가 답변을 생성한다"는 뜻이에요.)

> ✨ 왜 이렇게 하나요?
데이터에 없는 내용을 Gemini가 지어내면 곤란하겠죠. 그래서 "이 데이터 안에서만 답해줘"라고 명확히 지시하는 게 핵심이에요.
> 

`ask_gemini(user_input, results, title_column)` 함수를 만들어보세요.

<aside>

함수가 해야 할 일:

1. `results`가 `None`이면 Gemini를 호출할 필요 없이 바로 "못 찾았다"는 안내 문구를 반환하세요.
2. `results`의 각 행을 반복하면서, Gemini가 읽기 좋은 텍스트(컨텍스트)로 정리하세요.
3. "사용자 질문 + 검색된 데이터"를 담은 프롬프트를 작성하되, **"데이터에 있는 내용만 근거로 답변하라"는 규칙을 반드시 포함**하세요.
4. `client.models.generate_content()`로 호출하고, 응답 텍스트(`response.text`)를 반환하세요.
5. Gemini 호출이 실패할 경우를 대비해 `try/except`로 감싸고, 실패 시 어제 만든 `format_answer()`로 대체 답변을 반환하세요.
- **힌트**: `results.iterrows()`, f-string으로 프롬프트 작성, `client.models.generate_content(model=..., contents=...)`, `try/except`
</aside>

- 🔽 **막혔다면 여기! 코드 확인하기 (충분히 고민해보셨겠죠? 😀)**
    
    ```python
        def ask_gemini(user_input, results, title_column):
            """
            user_input: 사용자의 원래 질문
            results: search_data()로 찾은 데이터프레임 (또는 None)
            title_column: 이름/제목 컬럼명
            """
            if results is None:
                # 검색 결과가 아예 없으면 Gemini를 호출할 필요 없이 바로 안내
                return "음... 관련된 정보를 찾지 못했어요 😥 다른 키워드로 물어봐 주실래요?"
    
            # 검색된 행들을 Gemini가 읽기 좋은 텍스트로 변환
            context = ""
            for idx, row in results.iterrows():
                context += f"-{row[title_column]}: "
                context += ", ".join([f"{col}={row[col]}" for col in search_columns])
                context += "\n"
    
            prompt = f"""당신은 친절한 Q&A 챗봇입니다. 아래는 사용자의 질문과 관련해서 데이터베이스에서 찾은 정보입니다.
    
        [사용자 질문]
    {user_input}
    
        [검색된 데이터]
    {context}
    
        [답변 규칙]
        1. 반드시 위 데이터에 있는 내용만 근거로 답변하세요. 데이터에 없는 내용은 지어내지 마세요.
        2. 친근하고 자연스러운 말투로, 이모지를 적절히 섞어 설명해주세요.
        3. 데이터에 있는 항목들을 나열만 하지 말고, 사용자 질문에 맞춰 요약하거나 비교해주세요.
        4. 답변은 5문장 이내로 간결하게 작성하세요.
        """
    
            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                return response.text
            except Exception as e:
                # Gemini 호출이 실패해도 챗봇이 멈추지 않도록 안전장치
                print("Gemini 호출 오류:", e)
                return format_answer(results, title_column)  # 어제 만든 함수로 대체 답변
    
        # 테스트 (본인 데이터에 맞는 키워드로 바꿔서 테스트하세요!)
        test_results = search_data("chicken")
        print(ask_gemini("치킨 들어간 요리 뭐 있어?", test_results, title_column))
    ```
    

---

## Step A-5️⃣ `심화` 자연어 질문을 알아서 이해하는 챗봇

어제 만든 `search_data()`는 사용자가 입력한 단어가 **정확히 컬럼 값에 포함**되어야만 찾을 수 있었어요. 예를 들어 "닭고기 들어간 거 추천해줘"라고 물으면 `search_columns`에 "닭고기"라는 한글 단어가 없어서 못 찾을 수 있죠.

이번엔 Gemini에게 먼저 "이 질문에서 검색할 만한 키워드가 뭐야?"라고 물어본 뒤, 그 키워드로 `search_data()`를 실행하는 2단계 구조를 만들어봅니다.

`extract_keyword(user_input)` 함수를 만들어보세요.

<aside>

함수가 해야 할 일:

1. 사용자의 질문에서 검색에 쓸 핵심 키워드 1개만 뽑아달라는 프롬프트를 작성하세요. (설명 없이 키워드만 출력하도록 명확히 지시)
2. 짧은 작업이니 가벼운 모델(`gemini-2.5-flash-lite`)로 호출하세요.
3. 응답 텍스트의 앞뒤 공백을 제거(`strip()`)한 뒤 반환하세요.
4. 호출이 실패하면 원래 사용자 입력을 그대로 반환하세요.
- **힌트**: `response.text.strip()`, `try/except`
</aside>

- 🔽 **막혔다면 여기! 코드 확인하기 (충분히 고민해보셨겠죠? 😀)**
    
    ```python
        def extract_keyword(user_input):
            """
            자연어 질문에서 데이터 검색에 쓸 핵심 키워드(영어 or 데이터에 쓰인 언어)를 추출
            """
            prompt = f"""다음은 사용자가 데이터에서 무언가를 찾기 위해 입력한 질문입니다.
        이 질문에서 검색에 사용할 핵심 키워드 1개만 뽑아주세요.
        설명 없이 키워드 단어(또는 짧은 구)만 출력하세요.
    
        질문: "{user_input}"
        키워드:"""
    
            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash-lite",  # 짧은 작업이라 가벼운 모델로 충분해요
                    contents=prompt
                )
                keyword = response.text.strip()
                return keyword
            except Exception as e:
                print("키워드 추출 오류:", e)
                return user_input  # 실패하면 원래 입력 그대로 사용
    
        # 테스트
        print(extract_keyword("닭고기 들어간 요리 추천해줘"))
        # 예: "chicken" 처럼 데이터에 맞는 키워드가 나올 수 있어요
    ```
    

<aside>
💡

Gemini가 뽑아주는 키워드가 항상 정확하진 않아요. `search_data()`가 결과를 못 찾으면, 원래 사용자 입력으로 한 번 더 검색해보는 이중 안전장치를 Step A-6에서 추가합니다.

어제 만든 `search_data()`는 사용자가 입력한 단어가 **정확히 컬럼 값에 포함**되어야만 찾을 수 있었어요. 예를 들어 "닭고기 들어간 거 추천해줘"라고 물으면 `search_columns`에 "닭고기"라는 한글 단어가 없어서 못 찾을 수 있죠.

</aside>

---

## Step A-6️⃣ 최종 챗봇 함수 완성 + 안전장치

지금까지 만든 조각들을 하나로 합쳐서 최종 `chatbot_v2()` 함수를 만듭니다.

> 함수가 해야 할 일:
> 
> 1. `extract_keyword()`로 자연어 질문에서 키워드를 추출하고, 그 키워드로 `search_data()`를 실행하세요.
> 2. 결과가 없으면, 원래 사용자 입력으로 한 번 더 `search_data()`를 실행하세요. (2차 안전장치)
> 3. 그래도 결과가 없으면 정직하게 "못 찾았다"고 안내하세요.
> 4. 결과가 있으면 `ask_gemini()`를 호출해서 자연스러운 답변을 반환하세요.
> - **힌트**: 앞서 만든 `extract_keyword()`, `search_data()`, `ask_gemini()`를 순서대로 조합하면 됩니다.

- 🔽 **막혔다면 여기! 코드 확인하기 (충분히 고민해보셨겠죠? 😀)**
    
    ```python
        def chatbot_v2(user_input, title_column):
            # 1차: 자연어 질문에서 키워드 추출 시도
            keyword = extract_keyword(user_input)
            results = search_data(keyword)
    
            # 2차: 키워드로 못 찾았으면 원래 입력으로 한 번 더 시도
            if results is None:
                results = search_data(user_input)
    
            # 3차: 그래도 없으면 정직하게 못 찾았다고 안내
            if results is None:
                return "음... 관련된 정보를 찾지 못했어요 😥 다른 키워드로 물어봐 주실래요?"
    
            # Gemini에게 자연스러운 답변 생성 요청
            return ask_gemini(user_input, results, title_column)
    
        # 테스트
        title_column = 'title'  # 본인 데이터의 제목 컬럼명으로 수정!
        print(chatbot_v2("매운 음식 추천해줘", title_column))
    ```
    

<aside>
💡

**할당량 초과 대비**

무료 티어는 분당/일일 요청 수 제한이 있어요. `ask_gemini()`와 `extract_keyword()` 안에 이미 `try/except`를 넣어뒀기 때문에, 할당량을 초과하거나 네트워크 오류가 나도 챗봇이 멈추지 않고 어제 만든 키워드 기반 답변(`format_answer`)으로 자연스럽게 대체됩니다

</aside>

---

## Step A-7️⃣ Gradio에 연결하기

어제 만든 Gradio 채팅창에 `chatbot_v2()`를 연결해서, 자연어로 대화하는 챗봇을 실제로 사용해봅니다.

```python
!pip install -q gradio

import gradio as gr

def gradio_chatbot_v2(message, history):
    return chatbot_v2(message, title_column)

demo = gr.ChatInterface(
    fn=gradio_chatbot_v2,
    title="🤖 나만의 CSV 챗봇 (Gemini 연동 버전)",
    description="자연스러운 문장으로 편하게 물어보세요! (데이터: 본인 데이터셋 이름 적기)",
    examples=["매운 음식 추천해줘", "치킨 들어간 거 뭐 있어?"],  # 본인 데이터에 맞게 수정
)

demo.launch(share=True)
```

<aside>
💞

채팅창을 더 예쁘게 꾸미고 싶다면, 아래 B의 UX 기법들을 `gradio_chatbot_v2` 함수에도 그대로 적용할 수 있어요!

</aside>

---

# 🍄 B. 챗봇 UX 다듬기

<aside>

💡**아래 내용은 예시일 뿐입니다!**

예시를 그대로 따라 하기보다, **여러분만의 아이디어를 더해 더 예쁘고 편리한 UX를 만들어보세요.**

작은 디테일 하나만 바꿔도 나만의 개성이 담긴 챗봇이 될 수 있습니다. 😊

</aside>

- [ ]  **`예시 1`** 답변 메시지 예쁘게 꾸미기
- [ ]  **`예시 2`** 빠른 질문 버튼 & 카테고리 필터 만들기
- [ ]  **`예시 3`** 채팅창 테마 & 아바타 꾸미기
- [ ]  **`예시 4`** 실시간 타이핑 효과 넣기
- [ ]  **`예시 5`** 사이드바 레이아웃으로 완성하기 (결과 개수 조절 + 최근 검색어)

---

## Step B-1️⃣ 답변 메시지 예쁘게 꾸미기

어제 만든 `format_answer()`는 결과를 텍스트로 나열만 했어요. 이번엔 **강조 표시, 순위 이모지, 구분선** 등을 넣어서 훨씬 읽기 편하게 만들어봅니다.

 ****✨ **예시 코드**

```python
def format_answer_v2(results, title_column):
    """
    검색 결과를 더 보기 좋게 꾸며주는 함수
    """
    if results is None:
        return "음... 관련된 정보를 찾지 못했어요 😥 다른 키워드로 물어봐 주실래요?"

    rank_emojis = ["🥇", "🥈", "🥉", "🔹", "🔹"]  # 상위 결과 강조
    answer = f"### 이런 걸 찾았어요! 총 **{len(results)}개**를 보여드릴게요 👇\n\n"

    for i, (idx, row) in enumerate(results.iterrows()):
        emoji = rank_emojis[i] if i < len(rank_emojis) else "🔹"
        answer += f"{emoji} **{row[title_column]}**\n"
        for col in search_columns:
            value = row[col]
            answer += f"> **{col}**:{value}\n"
        answer += "\n---\n\n"

    return answer

def chatbot_v3(user_input, title_column):
    results = search_data(user_input)
    return format_answer_v2(results, title_column)

# 테스트
print(chatbot_v3("chicken", title_column))  # 본인 데이터에 맞는 키워드로 변경
```

---

## Step B-2️⃣ 빠른 질문 버튼 & 카테고리 필터 만들기

사용자가 매번 타이핑하지 않아도, 버튼 클릭만으로 질문할 수 있게 만들어봅니다. `gr.Blocks`를 사용하면 `gr.ChatInterface`보다 자유롭게 레이아웃을 구성할 수 있어요.

✨ **예시 코드**

```python
import gradio as gr

# 본인 데이터에서 자주 검색될 만한 키워드 3~5개로 수정하세요
quick_keywords = ["chicken", "pasta", "dessert", "vegan"]

with gr.Blocks() as demo:
    gr.Markdown("## 🤖 나만의 CSV 챗봇")

    chatbot_ui = gr.Chatbot(type="messages", height=400)
    msg = gr.Textbox(placeholder="궁금한 걸 물어보세요!", label="질문 입력")

    with gr.Row():
        quick_buttons = [gr.Button(kw) for kw in quick_keywords]

    def respond(message, history):
        answer = chatbot_v3(message, title_column)
        history = history + [
            {"role": "user", "content": message},
            {"role": "assistant", "content": answer},
        ]
        return history, ""

    msg.submit(respond, [msg, chatbot_ui], [chatbot_ui, msg])

    # 버튼 클릭 시 해당 키워드로 바로 질문
    for btn in quick_buttons:
        btn.click(respond, [btn, chatbot_ui], [chatbot_ui, msg])

demo.launch(share=True)
💡
카테고리 필터를 추가하고 싶다면?
`gr.Dropdown(choices=["전체", "요리", "디저트"], label="카테고리")`를 추가하고, 선택값에 따라 `search_data()` 호출 전에 `df`를 먼저 필터링하도록 코드를 확장해보세요.
```

---

## Step B-3️⃣ 채팅창 테마 & 아바타 꾸미기

Gradio는 내장 테마와 아바타 이미지를 지원해요. 챗봇의 성격에 맞게 꾸며봅니다.

✨ **예시 코드**

```python
demo = gr.ChatInterface(
    fn=lambda message, history: chatbot_v3(message, title_column),
    title="🍳 레시피 탐험대",  # 본인 데이터 컨셉에 맞게 수정
    description="궁금한 재료나 요리를 물어보세요!",
    theme=gr.themes.Soft(primary_hue="orange"),  # Soft, Glass, Monochrome 등 다양하게 시도해보세요
    chatbot=gr.Chatbot(
        avatar_images=(
            None,  # 사용자 아바타 (None이면 기본 아이콘)
            "https://em-content.zobj.net/source/apple/391/robot_1f916.png",  # 챗봇 아바타 이미지 URL
        ),
        height=450,
    ),
    examples=["chicken", "pasta"],  # 본인 데이터에 맞게 수정
)

demo.launch(share=True)
```

---

## Step B-4️⃣ 실시간 타이핑 효과 넣기

AI 호출 없이도, 이미 만들어진 답변을 **한 글자씩 순차적으로 보여주면** 훨씬 생동감 있는 챗봇이 됩니다.

✨ **예시 코드**

```python
import time

def chatbot_typing_effect(message, history):
    full_answer = chatbot_v3(message, title_column)

    partial = ""
    for ch in full_answer:
        partial += ch
        yield partial
        time.sleep(0.01)  # 숫자를 조절해서 타이핑 속도를 바꿔보세요

demo = gr.ChatInterface(fn=chatbot_typing_effect, title="⌨️ 타이핑 효과 챗봇")
demo.launch(share=True)
```

---

## Step B-5️⃣ 사이드바 레이아웃으로 완성하기

지금까지 만든 요소들을 `gr.Blocks`로 한 화면에 모아, **결과 개수 조절 슬라이더**와 **최근 검색어 사이드바**까지 갖춘 완성형 UI를 만들어봅니다.

✨ **예시 코드**

```python
recent_searches = []  # 세션 동안 최근 검색어를 기억할 리스트

def respond_with_sidebar(message, history, top_n):
    global recent_searches

    results = search_data(message, top_n=int(top_n))
    answer = format_answer_v2(results, title_column)

    recent_searches.insert(0, message)
    recent_searches[:] = recent_searches[:5]  # 최근 5개만 유지

    history = history + [
        {"role": "user", "content": message},
        {"role": "assistant", "content": answer},
    ]
    sidebar_text = "### 🕘 최근 검색어\n" + "\n".join([f"-{s}" for s in recent_searches])
    return history, "", sidebar_text

with gr.Blocks(theme=gr.themes.Soft()) as demo:
    gr.Markdown("## 🤖 나만의 CSV 챗봇 — 완성형 UI")

    with gr.Row():
        with gr.Column(scale=3):
            chatbot_ui = gr.Chatbot(type="messages", height=430)
            msg = gr.Textbox(placeholder="궁금한 걸 물어보세요!", label="질문 입력")
            top_n_slider = gr.Slider(1, 10, value=3, step=1, label="결과 개수")

        with gr.Column(scale=1):
            sidebar = gr.Markdown("### 🕘 최근 검색어\n(아직 없음)")

    msg.submit(
        respond_with_sidebar,
        [msg, chatbot_ui, top_n_slider],
        [chatbot_ui, msg, sidebar],
    )

demo.launch(share=True)
```

---

## 📢 제출하기

<aside>

여러분~! 오늘 심화 과정은 잘 진행되고 있으신가요? 🤖✨

Gemini AI를 연결해 **더 똑똑한 챗봇**을 만들어보신 분들도 계실 것이고,

챗봇의 화면과 사용성을 다듬어 **나만의 개성이 담긴 UX**를 완성하고 계신 분들도 있을 것 같습니다.

아직 진행 중인 분들도 괜찮습니다! 😊

오늘은 할 수 있는 만큼 진행하시고, **완성하지 못한 부분은 내일 ZEP 시간에 이어서 마무리**해주시면 됩니다.

오늘 작업한 **챗봇 결과물은 꼭 캡처하여 `질문·잡담방` 스레드에 업로드**해주세요!

서로의 결과물을 보며 아이디어도 얻고, 더 멋진 챗봇으로 발전시켜 봅시다! 🚀

</aside>