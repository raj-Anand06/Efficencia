function normalizeTopicKey(topic) {
  return String(topic || '')
    .trim()
    .toLowerCase();
}

const QUESTION_BANKS = [
  {
    topic: 'Computer Networks',
    keywords: ['computer network', 'computer networks', 'network', 'networks', 'cn'],
    questions: [
      {
        question: 'Which layer of the OSI model is responsible for routing packets between networks?',
        options: ['Transport layer', 'Network layer', 'Session layer', 'Data link layer'],
        correctAnswer: 'B',
        explanation:
          'Routing and logical addressing are handled by the Network layer in the OSI model.',
      },
      {
        question: 'What is the primary purpose of an IP address?',
        options: [
          'To identify a device on a network',
          'To encrypt packets',
          'To compress data',
          'To assign a MAC address',
        ],
        correctAnswer: 'A',
        explanation:
          'An IP address uniquely identifies a device interface on an IP network.',
      },
      {
        question: 'Which protocol is commonly used to reliably deliver web page data over the internet?',
        options: ['UDP', 'ICMP', 'TCP', 'ARP'],
        correctAnswer: 'C',
        explanation:
          'TCP provides reliable, ordered delivery and is used by HTTP and HTTPS.',
      },
      {
        question: 'Which device forwards packets between different networks?',
        options: ['Hub', 'Switch', 'Repeater', 'Router'],
        correctAnswer: 'D',
        explanation:
          'Routers connect networks and forward packets based on IP addresses and routing tables.',
      },
      {
        question: 'What does DNS mainly do?',
        options: [
          'Assigns dynamic IP addresses to hosts',
          'Translates domain names into IP addresses',
          'Encrypts traffic end to end',
          'Controls packet retransmission',
        ],
        correctAnswer: 'B',
        explanation:
          'DNS resolves human-readable domain names like example.com into IP addresses.',
      },
      {
        question: 'Which address is used by switches at the data link layer?',
        options: ['Port number', 'MAC address', 'IP address', 'URL'],
        correctAnswer: 'B',
        explanation:
          'Switches forward frames using MAC addresses, which belong to the data link layer.',
      },
      {
        question: 'Why is UDP considered faster than TCP in many cases?',
        options: [
          'It uses smaller IP addresses',
          'It avoids connection setup and retransmission guarantees',
          'It automatically compresses payloads',
          'It only works on local networks',
        ],
        correctAnswer: 'B',
        explanation:
          'UDP has less overhead because it does not establish a connection or guarantee delivery.',
      },
    ],
  },
  {
    topic: 'Operating Systems',
    keywords: ['operating system', 'operating systems', 'os'],
    questions: [
      {
        question: 'What is the main purpose of process scheduling in an operating system?',
        options: [
          'To assign IP addresses to processes',
          'To decide which process gets CPU time',
          'To store files permanently',
          'To encrypt memory pages',
        ],
        correctAnswer: 'B',
        explanation:
          'CPU scheduling decides which ready process should execute next on the processor.',
      },
      {
        question: 'Which memory is typically fastest and closest to the CPU?',
        options: ['Hard disk', 'Cache memory', 'Optical disk', 'Virtual memory'],
        correctAnswer: 'B',
        explanation:
          'Cache memory is very fast and is designed to reduce average access time for the CPU.',
      },
      {
        question: 'What problem does deadlock describe?',
        options: [
          'Multiple processes waiting forever for resources held by each other',
          'A process finishing too quickly',
          'A file being duplicated',
          'A network cable failure',
        ],
        correctAnswer: 'A',
        explanation:
          'Deadlock occurs when processes are stuck waiting on resources in a circular dependency.',
      },
      {
        question: 'What is virtual memory mainly used for?',
        options: [
          'To replace the CPU',
          'To allow programs to use more memory than physical RAM alone',
          'To store BIOS settings',
          'To improve monitor resolution',
        ],
        correctAnswer: 'B',
        explanation:
          'Virtual memory extends apparent memory capacity by using disk-backed pages.',
      },
      {
        question: 'Which system component manages files and directories?',
        options: ['Compiler', 'File system', 'Assembler', 'Bootloader'],
        correctAnswer: 'B',
        explanation:
          'The file system organizes, stores, and retrieves files and directory metadata.',
      },
      {
        question: 'What is a context switch?',
        options: [
          'Changing the programming language',
          'Saving one process state and loading another',
          'Formatting a disk',
          'Encrypting a process',
        ],
        correctAnswer: 'B',
        explanation:
          'During a context switch, the OS saves the current process state and restores another.',
      },
    ],
  },
  {
    topic: 'DBMS',
    keywords: ['dbms', 'database', 'databases', 'sql', 'normalization'],
    questions: [
      {
        question: 'What is the primary goal of normalization in databases?',
        options: [
          'To increase redundancy',
          'To reduce redundancy and improve consistency',
          'To replace SQL with NoSQL',
          'To make queries slower',
        ],
        correctAnswer: 'B',
        explanation:
          'Normalization reduces repeated data and helps prevent update anomalies.',
      },
      {
        question: 'Which SQL command is used to retrieve data from a table?',
        options: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
        correctAnswer: 'A',
        explanation:
          'SELECT is the SQL command used to query and retrieve rows from a table.',
      },
      {
        question: 'What does a primary key do?',
        options: [
          'Encrypts a table',
          'Uniquely identifies each row in a table',
          'Stores duplicate values',
          'Creates a backup automatically',
        ],
        correctAnswer: 'B',
        explanation:
          'A primary key uniquely identifies each record and does not allow duplicate null values.',
      },
      {
        question: 'Which normal form removes partial dependency on a composite key?',
        options: ['1NF', '2NF', 'BCNF', '4NF'],
        correctAnswer: 'B',
        explanation:
          'Second Normal Form eliminates partial dependency on part of a composite key.',
      },
      {
        question: 'What is the purpose of a foreign key?',
        options: [
          'To sort a table alphabetically',
          'To link rows between related tables',
          'To compress rows',
          'To replace indexing',
        ],
        correctAnswer: 'B',
        explanation:
          'A foreign key enforces referential integrity between related tables.',
      },
      {
        question: 'Which operation combines rows from two tables based on a related column?',
        options: ['GROUP BY', 'JOIN', 'ORDER BY', 'TRUNCATE'],
        correctAnswer: 'B',
        explanation:
          'JOIN combines data from multiple tables using a relationship between columns.',
      },
    ],
  },
  {
    topic: 'Data Structures and Algorithms',
    keywords: ['dsa', 'data structure', 'data structures', 'algorithm', 'algorithms'],
    questions: [
      {
        question: 'Which data structure follows the Last In First Out principle?',
        options: ['Queue', 'Stack', 'Linked list', 'Heap'],
        correctAnswer: 'B',
        explanation:
          'A stack removes the most recently added item first, which is LIFO behavior.',
      },
      {
        question: 'Which traversal visits the root node before its child subtrees?',
        options: ['Inorder', 'Postorder', 'Preorder', 'Level mismatch'],
        correctAnswer: 'C',
        explanation:
          'Preorder traversal processes the root first, then the left and right subtrees.',
      },
      {
        question: 'What is the average time complexity of binary search on a sorted array?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
        correctAnswer: 'B',
        explanation:
          'Binary search repeatedly halves the search space, giving logarithmic time complexity.',
      },
      {
        question: 'Which data structure is commonly used to implement BFS?',
        options: ['Stack', 'Queue', 'Heap', 'Hash map'],
        correctAnswer: 'B',
        explanation:
          'Breadth-first search uses a queue to explore nodes level by level.',
      },
      {
        question: 'What is the worst-case time complexity of traversing all nodes in a graph using DFS?',
        options: ['O(V + E)', 'O(log V)', 'O(V^2) always', 'O(1)'],
        correctAnswer: 'A',
        explanation:
          'Depth-first search visits each vertex and edge at most once, leading to O(V + E).',
      },
      {
        question: 'Which sorting algorithm repeatedly swaps adjacent out-of-order elements?',
        options: ['Merge sort', 'Quick sort', 'Bubble sort', 'Heap sort'],
        correctAnswer: 'C',
        explanation:
          'Bubble sort compares adjacent items and swaps them when they are in the wrong order.',
      },
    ],
  },
];

const GENERIC_QUESTIONS = [
  {
    question: 'Why is active recall considered effective for study revision?',
    options: [
      'It avoids testing understanding',
      'It strengthens retrieval of learned concepts',
      'It removes the need for practice',
      'It only works for mathematics',
    ],
    correctAnswer: 'B',
    explanation:
      'Active recall improves memory and understanding by forcing the learner to retrieve information.',
  },
  {
    question: 'What is the main benefit of breaking a broad topic into smaller subtopics?',
    options: [
      'It makes the topic impossible to revise',
      'It helps focused learning and progress tracking',
      'It removes the need for notes',
      'It guarantees perfect exam scores',
    ],
    correctAnswer: 'B',
    explanation:
      'Smaller chunks reduce overwhelm and make planning and retention easier.',
  },
  {
    question: 'Which habit best supports long-term retention of technical topics?',
    options: ['Cramming once', 'Spaced revision', 'Avoiding practice problems', 'Skipping explanations'],
    correctAnswer: 'B',
    explanation:
      'Spaced revision reinforces memory over time and is more effective than one-time cramming.',
  },
  {
    question: 'Why is solving practice questions useful after studying theory?',
    options: [
      'It checks whether concepts can be applied',
      'It replaces the need to understand fundamentals',
      'It always guarantees faster coding',
      'It reduces conceptual clarity',
    ],
    correctAnswer: 'A',
    explanation:
      'Practice questions reveal whether the learner can actually use the concepts they studied.',
  },
  {
    question: 'Which reflection question is most useful after a study session?',
    options: [
      'What colors were on the screen?',
      'What concepts can I explain without looking at notes?',
      'How long was the internet cable?',
      'Did I use a mouse or trackpad?',
    ],
    correctAnswer: 'B',
    explanation:
      'Explaining ideas without notes is a strong check of real understanding.',
  },
  {
    question: 'What is a practical sign that a study task is truly complete?',
    options: [
      'The title sounds impressive',
      'The learner can answer concept questions correctly',
      'The notes are very long',
      'The session took many hours',
    ],
    correctAnswer: 'B',
    explanation:
      'A task is better verified by demonstrated understanding than by time spent alone.',
  },
];

function getQuestionBank(topic) {
  const normalizedTopic = normalizeTopicKey(topic);

  return (
    QUESTION_BANKS.find((bank) =>
      bank.keywords.some((keyword) => normalizedTopic.includes(keyword))
    ) || {
      topic: String(topic || 'Study Topic').trim() || 'Study Topic',
      questions: GENERIC_QUESTIONS,
    }
  );
}

export function generateFallbackStudyQuiz({ topic, questionCount }) {
  const bank = getQuestionBank(topic);

  return {
    topic: bank.topic,
    questions: bank.questions.slice(0, questionCount),
  };
}
