#include <iostream>
#include <fstream>
#include <vector>
#include <algorithm>
#include <string>
#include <random>
#include <queue>

std::ofstream output;
std::ofstream result;
int size = 0;
int popCount = 0;
int popStartIndex = 1;
int index = 1;
bool randomized;
int longCount;
std::mt19937 generator;
std::queue<unsigned int> queue;

void push()
{
    output << "push ";
    for (int i = 0; i < longCount; ++i)
    {
        unsigned number = (randomized ? (unsigned int)generator() : index++);
        queue.push(number);
        output << number;
    }
    output << "\n";
    size++;
}

void pop()
{
    output << "pop\n";
    for (int i = 0; i < longCount; ++i)
    {
        result << queue.front();
        queue.pop();
    }
    result << '\n';
    size--;
    popCount++;
}

void popOverflow()
{
    output << "pop\n";
    result << "Queue is empty. Nothing to pop!\n";
}

int main() {
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

    std::cout << "Numbers count as one long number (from 1): ";
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