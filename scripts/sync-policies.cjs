
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const secret = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!secret) {
  throw new Error("GitHub Secrets에 FIREBASE_SERVICE_ACCOUNT를 등록해 주세요.");
}

let serviceAccount;

try {
  serviceAccount = JSON.parse(secret);
} catch {
  throw new Error("FIREBASE_SERVICE_ACCOUNT의 JSON 형식을 확인해 주세요.");
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// 한국시간 기준으로 마감일 계산
function dateAfter(days) {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  kst.setUTCDate(kst.getUTCDate() + days);
  return kst.toISOString().slice(0, 10);
}

// 실제 정책이 아닌 테스트용 가상 데이터
const demoPolicies = [
  {
    id: "demo-job-01",
    title: "[가상] 청년 취업 준비 지원",
    region: "전국",
    category: "취업",
    minAge: 19,
    maxAge: 34,
    deadline: dateAfter(12),
    summary: "취업 준비 활동을 지원하는 가상 정책이에요.",
    link: ""
  },
  {
    id: "demo-home-01",
    title: "[가상] 경기도 청년 월세 지원",
    region: "경기",
    category: "주거",
    minAge: 19,
    maxAge: 39,
    deadline: dateAfter(25),
    summary: "주거비 지원 조건을 보여주는 가상 정책이에요.",
    link: ""
  },
  {
    id: "demo-study-01",
    title: "[가상] 서울 청년 역량 강화 교육",
    region: "서울",
    category: "교육",
    minAge: 18,
    maxAge: 34,
    deadline: dateAfter(5),
    summary: "교육과 자격증 지원을 보여주는 가상 정책이에요.",
    link: ""
  },
  {
    id: "demo-start-01",
    title: "[가상] 예비 창업자 지원 프로그램",
    region: "전국",
    category: "창업",
    minAge: 18,
    maxAge: 39,
    deadline: dateAfter(30),
    summary: "창업 멘토링을 보여주는 가상 정책이에요.",
    link: ""
  }
];

async function main() {
  const batch = db.batch();

  for (const { id, ...policy } of demoPolicies) {
    batch.set(db.collection("policies").doc(id), {
      ...policy,
      isDemo: true,
      updatedAt: FieldValue.serverTimestamp()
    });
  }

  await batch.commit();

  console.log(
    `Firestore 저장 성공: 가상 정책 ${demoPolicies.length}개`
  );
}

main().catch((error) => {
  console.error("Firestore 저장 실패:", error.message);
  process.exitCode = 1;
});
