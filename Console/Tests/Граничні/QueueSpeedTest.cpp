#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
#include <time.h>
#include <random>

long long Input()
{
    long long number;
    std::cin >> number;
    return number;
}

void Output(const int number, bool newLine = false)
{
    std::cout << number << (newLine ? '\n' : ' ');
}

struct Stack
{
    Stack *previous = 0;
    long long value;
    long long size;

    Stack(Stack *previous, long long value)
    {
        this->previous = previous;
        this->value = value;
        size = previous->size + 1;
    }

    Stack()
    {
        size = 0;
    }

    Stack *Push(long long value)
    {
        return new Stack(this, value);
    }

    Stack *Pop()
    {
        Stack *temp = previous;
        delete this;
        return temp;
    }
};

struct Queue
{
    Stack *leftReserve;
    Stack *left;
    Stack *right;
    Stack *mediate;
    Stack *rightCopyReserve;
    Stack *rightCopy;
    bool recopy;
    long long toCopy;
    bool rightCopied;
    int size = 0;

    Queue()
    {
        leftReserve = new Stack();
        left = new Stack();
        right = new Stack();
        mediate = new Stack();
        rightCopyReserve = new Stack();
        rightCopy = new Stack();

        recopy = false;
        toCopy = 0;
        rightCopied = false;
        size = 0;
    }

    void Push(long long value)
    {
        size++;
        if (recopy)
        {
            leftReserve = leftReserve->Push(value);
            Recopy();
        }
        else
        {
            if (rightCopyReserve->size)
            {
                rightCopyReserve = rightCopyReserve->Pop();
            }
            left = left->Push(value);
            if (left->size > right->size)
            {
                recopy = true;
                Recopy();
            }
        }
    }

    long long Pop()
    {
        size--;
        long long value;
        if (recopy)
        {
            value = rightCopy->value;
            rightCopy = rightCopy->Pop();
            if (toCopy > 0)
            {
                toCopy--;
            }
            else
            {
                right = right->Pop();
                rightCopyReserve = rightCopyReserve->Pop();
            }
            Recopy();
        }
        else
        {
            value = right->value;
            right = right->Pop();
            rightCopy = rightCopy->Pop();
            if (rightCopyReserve->size)
            {
                rightCopyReserve = rightCopyReserve->Pop();
            }
            if (left->size > right->size)
            {
                recopy = true;
                Recopy();
            }
        }
        return value;
    }

    void Recopy()
    {
        int actions = 3;
        while (!rightCopied && right->size && actions)
        {
            mediate = mediate->Push(right->value);
            right = right->Pop();
            ++toCopy;
            --actions;
        }

        while (left->size && actions)
        {
            rightCopied = true;
            right = right->Push(left->value);
            rightCopyReserve = rightCopyReserve->Push(left->value);
            left = left->Pop();
            --actions;
        }

        while (toCopy > 0 && actions)
        {
            right = right->Push(mediate->value);
            rightCopyReserve = rightCopyReserve->Push(mediate->value);
            mediate = mediate->Pop();
            --toCopy;
            --actions;
        }

        while (mediate->size && actions)
        {
            mediate = mediate->Pop();
            --actions;
        }

        if (actions)
        {
            Stack *temp = rightCopy;
            rightCopy = rightCopyReserve;
            rightCopyReserve = temp;

            temp = left;
            left = leftReserve;
            leftReserve = temp;
            rightCopied = false;
            recopy = false;
        }
    }
};

int main() {
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(nullptr);

    Queue queue = Queue();
    std::cout << "Ready?\n";
    system("pause");

    srand(0);
    std::mt19937 generator;
    const unsigned int max = generator.max() * 0.5;
    while (true)
    {
        clock_t start = clock();
        for (int j = 0; j < 1000000; ++j)
        {
            if (generator() < max || queue.size == 0)
            {
                queue.Push(0);
                nominator++;
            }
            else
            {
                queue.Pop();
                denominator++;
            }
        }
        std::cout << "1 million operations time: " << clock() - start << " ms\n";
    }

    return 0;
}
