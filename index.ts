import { prompt } from 'enquirer';
const sortFunction = async (a: string, b: string) => {
    const answer = await prompt<{ a: string }>({
        type: 'select',
        choices: [a, b],
        message: 'which is better',
        name: 'a',
    });
    return answer.a === a;
};
async function merge<T>(
    left: T[],
    right: T[],
    cmp: (a: T, b: T) => Promise<any> | any
): Promise<T[]> {
    let resultArr: T[] = [],
        leftInd = 0,
        rightInd = 0;
    while (
        leftInd < left.length &&
        rightInd < right.length
    ) {
        if (await cmp(left[leftInd], right[rightInd])) {
            resultArr.push(left[leftInd]);
            leftInd++;
        } else {
            resultArr.push(right[rightInd]);
            rightInd++;
        }
    }
    return resultArr
        .concat(left.slice(leftInd))
        .concat(right.slice(rightInd));
}
async function mergeSort<T>(
    unsortedArray: T[],
    compareFunction: (a: T, b: T) => any
): Promise<T[]> {
    if (unsortedArray.length <= 1) {
        return unsortedArray;
    } else {
        const middle = Math.floor(unsortedArray.length / 2);
        const left = unsortedArray.slice(0, middle);
        const right = unsortedArray.slice(middle);
        return await merge(
            await mergeSort(left, compareFunction),
            await mergeSort(right, compareFunction),
            compareFunction
        );
    }
}
const folkloreSongs = [
    'all i need is an angel',
    'all that',
    'almost said it',
    'always on my mind',
    'automatically in love',
    'backseat',
    'beautiful',
    'black heart',
    'body language',
    'both sides now',
    'boy problems',
    'bucket',
    'call me maybe',
    'comeback',
    'cry',
    'curiosity',
    'cut to the feeling',
    'dear you',
    'drive',
    'emotion',
    'everything he needs',
    'everywhere you look',
    'e•mo•tion',
    'fake mona lisa',
    'favourite colour',
    'feels right',
    'felt this way',
    'fever',
    'first time',
    'for sure',
    'freddy my love',
    'gimmie love',
    'good time',
    'guitar string / wedding ring',
    'happy not knowing',
    'hate that you know me',
    'heartbeat',
    'heavy lifting',
    'higher',
    'hotel shampoos',
    'hurt so good',
    'i didn’t just come here to dance',
    'i know you have a girlfriend',
    'i really like you',
    'i still wonder',
    'in my bedroom',
    'it takes two',
    'i’ll be your girl',
    'julien',
    'just a step away',
    'la hallucinations',
    'lalala',
    'last christmas',
    'let it snow',
    "let's get lost",
    'let’s be friends',
    'let’s get lost',
    'let’s sort the whole thing out',
    "look at me i'm sandra dee",
    'love again',
    'love me like that',
    'making the most of the night',
    'melt with you',
    'mittens',
    'money and the ego',
    'more than a memory',
    'never get to hold you',
    'no drug like me',
    'now i don’t hate california after all',
    'now that i found you',
    'omg',
    'part of your world',
    'party for one',
    'petty language',
    'picture',
    'real love',
    'rest from the streets',
    'right words wrong time',
    'roses',
    'run away with me',
    'runaways',
    'shadow',
    'solo',
    'sour candy',
    'starships stay good',
    'stay away',
    'store',
    'summer love',
    'sunshine on my shoulders',
    'super natural',
    'sweet talker',
    'sweetie',
    'take a picture',
    'talk to me',
    'tell me',
    'the making of e•mo•tion',
    'the one',
    'the sound',
    'this is what they say',
    'this kiss',
    'this love isn’t crazy',
    'tiny little bows',
    'to be without you',
    "tonight i'm getting over you",
    'too much',
    'trouble in the streets',
    'tug of war',
    'turn me up',
    'want you in my room',
    'warm blood',
    'when i needed you',
    'window',
    'worldly matters',
    'wrong feels so right',
    'your heart is a muscle',
    'your type',
];

const run = async () => {
    const results = await mergeSort(
        folkloreSongs,
        sortFunction
    );
    console.log(results);
};
run();
