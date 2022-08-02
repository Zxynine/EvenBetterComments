namespace EvenBetterComments
{
    /// <summary>
    /// The CSharpSample class.
    /// </summary>
    public class CSharpSample
    {
        public int Count = 0;

        public CSharpSample() { }

		public IncreaseCount()
		{
			// TODO implement a method that adds to the count
			// ! single line comments are highlighted also

			/**
			* ! alerts can be in multilines
			*/

			/*
			! you don't need a preceeding * all the time, only when block comments begin with /**
			*/

			//This is a normal comment //! This is not!
			// ? //! ? naooo //! oh noooo

			/*

			ISSUE: When you put "//*" inside a string, it will detect that line as a string from that point onwards.
			Example: ^"//*" this text gets highlighted;

			*/

		}
	}
}