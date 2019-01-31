#include <iostream>
#include <fstream>
#include <vector>
#include <algorithm>
#include <string>
#include <random>
#include <queue>
#include <time.h>

std::ofstream output;
std::ofstream result;
int size = 0;
int popCount = 0;
int popStartIndex = 1;
int index = 1;
bool randomized;
int longCount;
std::mt19937 generator;
std::queue<std::string> queue;

std::string random_string(size_t length)
{
    auto randchar = []() -> char
    {
        const char charset[] =
            "0123456789"
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            "abcdefghijklmnopqrstuvwxyz";
        const size_t max_index = (sizeof(charset) - 1);
        return charset[rand() % max_index];
    };
    std::string str(length, 0);
    std::generate_n(str.begin(), length, randchar);
    return str;
}

void push()
{
    std::string str = random_string(rand() % longCount + 1);
    queue.push(str);
    output << "push " << str << "\n";
    size++;
}

void pop()
{
    output << "pop\n";
    result << queue.front() << '\n';
    queue.pop();
    size--;
    popCount++;
}

void popOverflow()
{
    output << "pop\n";
    result << "Queue is empty. Nothing to pop!\n";
}

int main() {
    srand(0);
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(nullptr);

    std::string testFilename;
    std::string resultFilename;
    int pushCount;
    int commandsCount;
    double pushPart;
    bool popOverflowEnabled;

    std::cout << "Test file name: ";
    std::cin >> testFilename;

    std::cout << "Result file name: ";
    std::cin >> resultFilename;

    std::cout << "Enter first push commands count: ";
    std::cin >> pushCount;

    std::cout << "Next commands count: ";
    std::cin >> commandsCount;

    std::cout << "Enter push part percentage (from 0 to 1): ";
    std::cin >> pushPart;

    std::cout << "Allow pop command overflow (1 if yes, 0 else): ";
    std::cin >> popOverflowEnabled;

    std::cout << "Randomized (1 if yes, 0 else): ";
    std::cin >> randomized;

    std::cout << "Maximum string size (from 1): ";
    std::cin >> longCount;
    
    output = std::ofstream(testFilename);
    result = std::ofstream(resultFilename);
    unsigned int max = generator.max();

    for (; index <= pushCount; ++index)
    {
        push();
    }

    for (int i = 0; i < commandsCount; ++i)
    {
        if ((double)generator() / (double)max < pushPart)
        {
            push();
        }
        else if (size > 0)
        {
            pop();
        }
        else if (popOverflowEnabled)
        {
            popOverflow();
        }
        else
        {
            push();
        }
    }

    result.close();
    output.close();
    return 0;
}