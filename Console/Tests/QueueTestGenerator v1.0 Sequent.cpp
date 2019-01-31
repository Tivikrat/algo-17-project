#include <iostream>
#include <fstream>
#include <vector>
#include <algorithm>
#include <string>
#include <random>

std::ofstream output;
std::ofstream result;
int size = 0;
int popCount = 0;
int popStartIndex = 1;

void push(int number)
{
    output << "push" << " " << number << "\n";
    size++;
}

void pop()
{
    output << "pop\n";
    size--;
    popCount++;
}

void popOverflow()
{
    output << "pop\n";
    while (popCount > 0)
    {
        result << popStartIndex++ << '\n';
        --popCount;
    }
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
    
    output = std::ofstream(testFilename);
    result = std::ofstream(resultFilename);
    std::mt19937 generator;
    unsigned int max = generator.max();

    int index = 1;
    for (; index <= pushCount; ++index)
    {
        push(index);
    }

    for (int i = 0; i < commandsCount; ++i)
    {
        if ((double)generator() / (double)max < pushPart)
        {
            push(index++);
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
            push(index++);
        }
    }

    while (popCount > 0)
    {
        result << popStartIndex++ << '\n';
        --popCount;
    }

    result.close();
    output.close();
    return 0;
}