#include <fstream>
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
#include <time.h>
#include <random>

template<class T>
struct Stack
{
    Stack *previous = 0;
    T value;
    long long size;

    Stack(Stack *previous, T value)
    {
        this->previous = previous;
        this->value = value;
        size = previous->size + 1;
    }

    Stack()
    {
        size = 0;
    }

    Stack *Push(T value)
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

template<class T>
struct Queue
{
    Stack<T> *leftReserve;
    Stack<T> *left;
    Stack<T> *right;
    Stack<T> *mediate;
    Stack<T> *rightCopyReserve;
    Stack<T> *rightCopy;
    bool recopy;
    long long toCopy;
    bool rightCopied;
    long long size;

    Queue()
    {
        leftReserve = new Stack<T>();
        left = new Stack<T>();
        right = new Stack<T>();
        mediate = new Stack<T>();
        rightCopyReserve = new Stack<T>();
        rightCopy = new Stack<T>();

        recopy = false;
        toCopy = 0;
        rightCopied = false;
        size = 0;
    }

    void Push(T value)
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

    T Pop()
    {
        size--;
        T value;
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
            Stack<T> *temp = rightCopy;
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

    std::ifstream _in;
    std::ofstream _out;

    _in = std::ifstream("input.txt");
    _out = std::ofstream("output.txt");

    Queue<std::string> queue = Queue<std::string>();

    std::string str;

    while (_in >> str)
    {
        if (str == "push" || str == "+")
        {
            std::string object;
            _in >> object;
            queue.Push(object);
        }
        else if (str == "pop" || str == "-")
        {
            _out << (queue.size ? queue.Pop() : "Queue is empty. Nothing to pop.") << "\n";
        }
    }

    _in.close();
    _out.close();

    return 0;
}
